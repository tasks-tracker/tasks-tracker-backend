import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ChangeTaskOrderCommand } from '../../commands';
import { TaskNotFoundDomainError, TaskRepository } from '../../../domain';
import { err, Result, ok } from 'neverthrow';

@CommandHandler(ChangeTaskOrderCommand)
export class ChangeTaskOrderCommandHandler
  implements ICommandHandler<ChangeTaskOrderCommand>
{
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(
    command: ChangeTaskOrderCommand,
  ): Promise<Result<void, TaskNotFoundDomainError>> {
    try {
      const taskResult = await this.taskRepository.findById(command.taskId);

      if (taskResult.isErr()) {
        return err(taskResult.error);
      }

      const task = taskResult.value;

      task.changeOrder(command.order);

      await this.taskRepository.save(task);

      return ok();
    } catch (error) {
      console.log(error);
      return err(new TaskNotFoundDomainError(command.taskId.value));
    }
  }
}
