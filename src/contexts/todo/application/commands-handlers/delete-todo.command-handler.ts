import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DeleteTodoCommand } from '@contexts/todo/application/commands/delete-todo.command';
import {
  InvalidTodoDescriptionDomainError,
  InvalidTodoTitleDomainError,
  Todo,
  TodoIdVO,
  TodoNotFoundDomainError,
  TodoRepository,
} from '@contexts/todo/domain';
import { err, ok, Result } from 'neverthrow';
import { TodoNotOwnerExceptionDomainError } from '@contexts/todo/domain/domain-errors/todo-not-owner-exception.domain-error';

@CommandHandler(DeleteTodoCommand)
export class DeleteTodoCommandHandler
  implements ICommandHandler<DeleteTodoCommand>
{
  constructor(public readonly todoRepository: TodoRepository) {}

  async execute(
    command: DeleteTodoCommand,
  ): Promise<
    Result<null, TodoNotFoundDomainError | TodoNotOwnerExceptionDomainError>
  > {
    const todo = await this.todoRepository.findById(command.todoId);

    if (!todo) {
      return err(new TodoNotFoundDomainError());
    }

    try {
      todo.delete(command.userId);
    } catch (e) {
      if (e instanceof TodoNotOwnerExceptionDomainError) {
        return err(e);
      }
      throw e;
    }

    await this.todoRepository.save(todo);

    return ok(null);
  }
}
