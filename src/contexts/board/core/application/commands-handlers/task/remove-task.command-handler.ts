import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { RemoveTaskCommand } from '../../commands';
import { TaskNotFoundDomainError, TaskRepository } from '../../../domain';
import { err, ok, Result } from 'neverthrow';

@CommandHandler(RemoveTaskCommand)
export class RemoveTaskCommandHandler
  implements ICommandHandler<RemoveTaskCommand>
{
  constructor(public readonly taskRepository: TaskRepository) {}

  async execute(
    command: RemoveTaskCommand,
  ): Promise<Result<void, TaskNotFoundDomainError>> {
    try {
      const taskResult = await this.taskRepository.findById(command.taskId);

      if (taskResult.isErr()) {
        return err(taskResult.error);
      }

      const task = taskResult.value;

      task.remove();

      await this.taskRepository.save(task);

      return ok();
    } catch (error) {
      console.log(error);
      return err(new TaskNotFoundDomainError(command.taskId.value));
    }
  }
}
