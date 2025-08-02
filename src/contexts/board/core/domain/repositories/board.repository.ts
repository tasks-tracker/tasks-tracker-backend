import { Result } from 'neverthrow';
import { Board } from '../aggregates';
import {
  BoardIdVO,
  BoardOwnerIdVO,
  BoardOwnerVO,
  BoardUserIdVO,
} from '../value-objects';
import {
  BoardAlreadyExistDomainError,
  BoardIsNotFoundDomainError,
  UserIsNotFoundDomainError,
} from '../domain-errors';

export abstract class BoardRepository {
  public abstract nextId(): BoardIdVO;

  public abstract save(
    board: Board,
  ): Promise<Result<null, BoardAlreadyExistDomainError>>;

  public abstract getUserId(
    owner: BoardOwnerVO,
  ): Promise<Result<BoardUserIdVO, UserIsNotFoundDomainError>>;

  public abstract findById(id: BoardIdVO): Promise<Board | null>;

  public abstract remove(
    boardId: BoardIdVO,
  ): Promise<Result<null, BoardIsNotFoundDomainError>>;

  public abstract changeOwner(
    boardId: BoardIdVO,
    ownerId: BoardOwnerIdVO,
  ): Promise<Result<null, BoardIsNotFoundDomainError>>;
}
