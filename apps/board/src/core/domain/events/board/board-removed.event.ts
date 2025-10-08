import { BoardIdVO } from '../../value-objects';

export class BoardRemovedEvent {
  constructor(readonly id: BoardIdVO) {}
}
