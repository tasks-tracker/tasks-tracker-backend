import { IsUUID } from 'class-validator';
import { validateSync } from 'class-validator';
import { ValidationException } from '../../../../libs';

export class UserIdVO {
  @IsUUID()
  public readonly value: string;
  constructor(value: string) {
    this.value = value;
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new ValidationException(errors);
    }
  }
}
