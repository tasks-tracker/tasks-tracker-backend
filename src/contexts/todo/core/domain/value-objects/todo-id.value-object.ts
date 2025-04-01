import { IsUUID, validateSync } from 'class-validator';
import { ValidationException } from '@libs/validation-exception';
import { randomUUID } from 'node:crypto';

export class TodoIdVO {
  @IsUUID()
  public readonly value: string;
  constructor(value: string) {
    this.value = value;
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new ValidationException(errors);
    }
  }

  static create(): TodoIdVO {
    const id = randomUUID();
    return new TodoIdVO(id);
  }
}
