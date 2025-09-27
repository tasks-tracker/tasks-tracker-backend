import { Board } from '../aggregates';
import { BoardIdVO, BoardTitleVO } from '../value-objects';
import { Result } from 'neverthrow';
import { DomainError } from 'libs/domain-error';

export abstract class BoardRepository {
  public abstract nextId(): BoardIdVO;

  public abstract save(board: Board): Promise<void>;

  public abstract findByTitle(
    title: BoardTitleVO,
  ): Promise<Result<BoardIdVO, DomainError>>;

  public abstract findById(id: BoardIdVO): Promise<Result<Board, DomainError>>;

  public abstract existById(id: BoardIdVO): Promise<boolean>;
}
