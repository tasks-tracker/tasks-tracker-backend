import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok, Result } from 'neverthrow';
import { TaskNotFoundDomainError, TaskRepository } from '../../../domain';
import { RenameTaskCommand } from '../../commands';

@CommandHandler(RenameTaskCommand)
export class RenameTaskCommandHandler
  implements ICommandHandler<RenameTaskCommand>
{
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(
    command: RenameTaskCommand,
  ): Promise<Result<void, TaskNotFoundDomainError>> {
    try {
      const taskResult = await this.taskRepository.findById(command.taskId);

      if (taskResult.isErr()) {
        return err(taskResult.error);
      }

      const task = taskResult.value;
      task.changeTitle(command.newTitle);

      await this.taskRepository.save(task);

      return ok();
    } catch (error) {
      console.log(error);
      return err(new TaskNotFoundDomainError(command.taskId.value));
    }
  }
}
