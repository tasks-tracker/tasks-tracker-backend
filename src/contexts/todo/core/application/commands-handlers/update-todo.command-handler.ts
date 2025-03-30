import type { ICommandHandler } from '@nestjs/cqrs';
import type { Result } from 'neverthrow';
import type { DomainError } from '@libs/domain-error';
import { CommandHandler } from '@nestjs/cqrs';
import { ok } from 'neverthrow';
import { err } from 'neverthrow';
import { UpdateTodoCommand } from '../commands';
import { TodoNotFoundDomainError } from '../../domain';
import { TodoRepository } from '../../domain';

@CommandHandler(UpdateTodoCommand)
export class UpdateTodoCommandHandler
  implements ICommandHandler<UpdateTodoCommand> {
  constructor(public readonly todoRepository: TodoRepository) { }

  async execute(command: UpdateTodoCommand): Promise<
    Result<null, DomainError>
  > {
    const todo = await this.todoRepository.findById(command.todoId);
    if (!todo) return err(new TodoNotFoundDomainError());

    const updateResult = todo.update(command.userId, command.title, command.description, command.deadline);
    if (updateResult.isErr()) return updateResult;

    await this.todoRepository.save(todo);
    todo.commit();
    return ok(null);
  }
}
