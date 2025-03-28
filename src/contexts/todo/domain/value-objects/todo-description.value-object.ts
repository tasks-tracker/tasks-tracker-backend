import { IsString, Length, validateSync } from 'class-validator';
import { ValidationException } from '@libs/validation-exception';

export class TodoDescriptionVO {
  @Length(1, 500)
  @IsString()
  public readonly value: string;
  constructor(value: string) {
    this.value = value;
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new ValidationException(errors);
    }
  }

  equals(description: TodoDescriptionVO): boolean {
    return this.value === description.value;
  }
}
