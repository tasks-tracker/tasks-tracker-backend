import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChangeTaskOwnerCommand } from '../../commands';
import {
  ColumnNotFoundDomainError,
  TaskNotFoundDomainError,
  TaskRepository,
} from '../../../domain';
import { err, Result, ok } from 'neverthrow';

@CommandHandler(ChangeTaskOwnerCommand)
export class ChangeTaskOwnerCommandHandler
  implements ICommandHandler<ChangeTaskOwnerCommand>
{
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(
    command: ChangeTaskOwnerCommand,
  ): Promise<Result<void, ColumnNotFoundDomainError>> {
    try {
      const taskResult = await this.taskRepository.findById(command.taskId);

      if (taskResult.isErr()) {
        return err(taskResult.error);
      }

      const task = taskResult.value;

      task.changeAssigner(command.ownerId);

      await this.taskRepository.save(task);

      return ok();
    } catch (error) {
      console.log(error);
      return err(new TaskNotFoundDomainError(command.taskId.value));
    }
  }
}
