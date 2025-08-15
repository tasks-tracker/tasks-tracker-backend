import { BoardIdVO } from '@contexts/board/core/domain/value-objects';

export class BoardRemovedEvent {
  constructor(readonly id: BoardIdVO) {}
}
