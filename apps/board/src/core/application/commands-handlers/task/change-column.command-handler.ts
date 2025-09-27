import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChangeTaskColumnCommand } from '../../commands';
import { ColumnNotFoundDomainError, TaskRepository } from '../../../domain';
import { err, Result, ok } from 'neverthrow';

@CommandHandler(ChangeTaskColumnCommand)
export class ChangeTaskColumnCommandHandler
  implements ICommandHandler<ChangeTaskColumnCommand>
{
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(
    command: ChangeTaskColumnCommand,
  ): Promise<Result<void, ColumnNotFoundDomainError>> {
    try {
      const taskResult = await this.taskRepository.findById(command.taskId);

      if (taskResult.isErr()) {
        return err(taskResult.error);
      }

      const task = taskResult.value;

      task.changeColumn(command.columnId);

      await this.taskRepository.save(task);

      return ok();
    } catch (error) {
      console.log(error);
      return err(new ColumnNotFoundDomainError(command.columnId.value));
    }
  }
}
