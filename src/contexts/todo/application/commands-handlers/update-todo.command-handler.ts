import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { UpdateTodoCommand } from '@contexts/todo/application/commands/update-todo.command';
import { TodoNotFoundDomainError, TodoRepository } from '@contexts/todo/domain';
import { err, ok, Result } from 'neverthrow';
import { TodoNotOwnerExceptionDomainError } from '@contexts/todo/domain/domain-errors/todo-not-owner-exception.domain-error';
import { isCollection } from 'yaml';

@CommandHandler(UpdateTodoCommand)
export class UpdateTodoCommandHandler
  implements ICommandHandler<UpdateTodoCommand>
{
  constructor(public readonly todoRepository: TodoRepository) {}

  async execute(
    command: UpdateTodoCommand,
  ): Promise<
    Result<null, TodoNotFoundDomainError | TodoNotOwnerExceptionDomainError>
  > {
    const todo = await this.todoRepository.findById(command.todoId);
    const { description, title, deadline, isCompleted } = command;

    if (!todo) {
      return err(new TodoNotFoundDomainError());
    }

    try {
      todo.update(title, isCompleted, description, deadline);
    } catch (error) {
      if (error instanceof TodoNotOwnerExceptionDomainError) {
        return err(error);
      }
      throw error;
    }

    await this.todoRepository.save(todo);
    return ok(null);
  }
}
