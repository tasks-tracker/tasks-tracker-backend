import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTaskCommand } from '../../commands';
import {
  ColumnAlreadyExistDomainError,
  TaskAlreadyExistDomainError,
  TaskIdVO,
  TaskRepository,
} from '../../../domain';
import { err, Result, ok } from 'neverthrow';
import { Task } from '../../../domain';
import { randomUUID } from 'crypto';

@CommandHandler(CreateTaskCommand)
export class CreateTaskCommandHandler
  implements ICommandHandler<CreateTaskCommand>
{
  constructor(private readonly taskRepository: TaskRepository) {}

  async execute(
    command: CreateTaskCommand,
  ): Promise<Result<string, ColumnAlreadyExistDomainError>> {
    try {
      const taskId = randomUUID();

      const newTask = Task.create(
        new TaskIdVO(taskId),
        command.title,
        command.description,
        command.order,
        command.columnId,
        new Date(),
        new Date(),
        command.ownerId,
        false,
      );

      await this.taskRepository.save(newTask);

      newTask.commit();

      return ok(newTask.id.value);
    } catch (error) {
      console.log(error);
      return err(new TaskAlreadyExistDomainError(command.title.value));
    }
  }
}
