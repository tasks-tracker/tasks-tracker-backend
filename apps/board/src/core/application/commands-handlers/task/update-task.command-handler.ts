import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { err, ok, Result } from 'neverthrow';
import { TaskNotFoundDomainError, TaskRepository } from '../../../domain';
import { UpdateTaskCommand } from '../../commands';
import { DomainError } from 'libs/domain-error';

@CommandHandler(UpdateTaskCommand)
export class UpdateTaskCommandHandler
  implements ICommandHandler<UpdateTaskCommand>
{
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(
    command: UpdateTaskCommand,
  ): Promise<Result<void, DomainError>> {
    try {
      const result = await this.taskRepository.findById(command.taskId!);

      if (result.isErr()) {
        return err(result.error);
      }

      const task = result.value;
      task.update({
        title: command.newTitle,
        description: command.newDescription,
        order: command.newOrder,
        columnId: command.newColumnId,
        assignerId: command.newUserId,
      });

      await this.taskRepository.save(task);

      return ok();
    } catch (error) {
      console.log(error);
      return err(new TaskNotFoundDomainError(command.taskId!.value));
    }
  }
}
