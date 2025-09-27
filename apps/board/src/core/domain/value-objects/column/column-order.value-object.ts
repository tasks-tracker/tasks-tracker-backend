import { Min } from 'class-validator';
import { validateSync } from 'class-validator';
import { ValidationException } from 'libs/validation-exception';

export class ColumnOrderVO {
  @Min(0, { message: 'Order must be a non-negative number' })
  public readonly value: number;
  constructor(value: number) {
    this.value = value;
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new ValidationException(errors);
    }
  }
}
