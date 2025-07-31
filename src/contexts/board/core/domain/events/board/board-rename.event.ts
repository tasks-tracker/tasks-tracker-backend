import type { BoardTitleVO } from '../../value-objects';

export class BoardRenameEvent {
  constructor(readonly name: BoardTitleVO) {}
}
