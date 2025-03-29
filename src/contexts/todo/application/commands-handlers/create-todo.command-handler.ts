import type { Result } from 'neverthrow';
import type { ICommandHandler } from '@nestjs/cqrs';
import type { TodoIdVO } from '../../domain';

import { CommandHandler } from '@nestjs/cqrs';
import { ok } from 'neverthrow';
import { CreateTodoCommand } from '../commands';
import { Todo } from '../../domain';
import { TodoRepository } from '../../domain';

@CommandHandler(CreateTodoCommand)
export class CreateTodoCommandHandler
  implements ICommandHandler<CreateTodoCommand> {
  constructor(
    public readonly todoRepository: TodoRepository,
  ) { }

  async execute(
    command: CreateTodoCommand,
  ): Promise<Result<TodoIdVO, never>> {
    const todoId = this.todoRepository.nextId();
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
  }
}
