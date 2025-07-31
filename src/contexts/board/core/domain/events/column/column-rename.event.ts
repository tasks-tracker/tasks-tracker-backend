import { ColumnTitleVO } from '../../value-objects';

export class ColumnRenameEvent {
  constructor(readonly id: ColumnTitleVO) {}
}
