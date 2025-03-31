import type { Result } from 'neverthrow';
import type { ICommandHandler } from '@nestjs/cqrs';
import type { DomainError } from '@libs/domain-error';

import { CommandHandler } from '@nestjs/cqrs';
import { ok } from 'neverthrow';
import { err } from 'neverthrow';
import { MarkTodoAsNotCompletedCommand } from '../commands/mark-todo-as-not-completed.command';
import { TodoNotFoundDomainError } from '../../domain';
import { TodoRepository } from '../../domain';

@CommandHandler(MarkTodoAsNotCompletedCommand)
export class MarkTodoAsNotCompletedCommandHandler
  implements ICommandHandler<MarkTodoAsNotCompletedCommand> {
  constructor(
    public readonly todoRepository: TodoRepository,
  ) { }

  async execute(
    command: MarkTodoAsNotCompletedCommand,
  ): Promise<Result<null, DomainError>> {
    const todo = await this.todoRepository.findById(command.todoId);
    if (!todo) return err(new TodoNotFoundDomainError());

    const result = todo.markIsNotCompleted(command.userId)
    if (result.isErr()) return result

    await this.todoRepository.save(todo);
    todo.commit();
    return ok(null);
  }
}
