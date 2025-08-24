import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChangeTaskDescriptionCommand } from '../../commands';
import { TaskNotFoundDomainError, TaskRepository } from '../../../domain';
import { err, Result, ok } from 'neverthrow';

@CommandHandler(ChangeTaskDescriptionCommand)
export class ChangeTaskDescriptionCommandHandler
  implements ICommandHandler<ChangeTaskDescriptionCommand>
{
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(
    command: ChangeTaskDescriptionCommand,
  ): Promise<Result<void, TaskNotFoundDomainError>> {
    try {
      const taskResult = await this.taskRepository.findById(command.taskId);

      if (taskResult.isErr()) {
        return err(taskResult.error);
      }

      const task = taskResult.value;

      task.changeDescription(command.description);

      await this.taskRepository.save(task);

      return ok();
    } catch (error) {
      console.log(error);
      return err(new TaskNotFoundDomainError(command.taskId.value));
    }
  }
}
