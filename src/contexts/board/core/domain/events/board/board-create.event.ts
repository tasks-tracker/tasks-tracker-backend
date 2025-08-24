import type { BoardIdVO } from '../../value-objects';

export class BoardCreatedEvent {
  constructor(readonly id: BoardIdVO) {}
}
