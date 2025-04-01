import type { ICommandHandler } from '@nestjs/cqrs';
import type { Result } from 'neverthrow';
import type { DomainError } from '@libs/domain-error';

import { CommandHandler } from '@nestjs/cqrs';
import { ok } from 'neverthrow';
import { err } from 'neverthrow';
import { DeleteTodoCommand } from '../commands';
import { TodoNotFoundDomainError } from '../../domain';
import { TodoRepository } from '../../domain';

@CommandHandler(DeleteTodoCommand)
export class DeleteTodoCommandHandler
  implements ICommandHandler<DeleteTodoCommand>
{
  constructor(public readonly todoRepository: TodoRepository) {}

  async execute(
    command: DeleteTodoCommand,
  ): Promise<Result<null, DomainError>> {
    const todo = await this.todoRepository.findById(command.todoId);
    if (!todo) return err(new TodoNotFoundDomainError());

    const deleteResult = todo.delete(command.userId);
    if (deleteResult.isErr()) return deleteResult;

    await this.todoRepository.save(todo);
    todo.commit();
    return ok(null);
  }
}
