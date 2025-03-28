import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { CreateTodoCommand } from '@contexts/todo/application/commands/create-todo.command';
import { Todo, TodoRepository, TodoIdVO } from '@contexts/todo/domain';
import { ok, Result, err } from 'neverthrow'; // Импортируйте err
import {
  InvalidTodoDescriptionDomainError,
  InvalidTodoTitleDomainError,
} from '@contexts/todo/domain';

@CommandHandler(CreateTodoCommand)
export class CreateTodoCommandHandler
  implements ICommandHandler<CreateTodoCommand>
{
  constructor(public readonly todoRepository: TodoRepository) {}

  async execute(
    command: CreateTodoCommand,
  ): Promise<
    Result<
      TodoIdVO,
      InvalidTodoDescriptionDomainError | InvalidTodoTitleDomainError
    >
  > {
    const todoId = this.todoRepository.nextId();

    try {
      const todo = Todo.create(
        todoId,
        command.title,

        command.description,
        command.deadline,
        command.userId,
      );

      await this.todoRepository.save(todo);

      todo.commit();

      return ok(todoId);
    } catch (error) {
      if (
        error instanceof InvalidTodoDescriptionDomainError ||
        error instanceof InvalidTodoTitleDomainError
      ) {
        return err(error);
      }

      console.error('Unexpected error creating todo:', error);
      throw error;
    }
  }
}
