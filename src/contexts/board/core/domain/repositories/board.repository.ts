import { Board } from '../aggregates';
import { BoardIdVO } from '../value-objects';

export abstract class BoardRepository {
  public abstract nextId(): BoardIdVO;

  public abstract save(board: Board): Promise<void>;

  public abstract findById(id: BoardIdVO): Promise<Board | null>;
}
