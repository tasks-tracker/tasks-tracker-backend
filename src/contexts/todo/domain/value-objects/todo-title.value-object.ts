import { IsString, Length, validateSync } from 'class-validator';
import { ValidationException } from '@libs/validation-exception';

export class TodoTitleVO {
  @Length(3, 50)
  @IsString()
  public readonly value: string;
  constructor(value: string) {
    this.value = value;
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new ValidationException(errors);
    }
  }

  equals(title: TodoTitleVO): boolean {
    return this.value === title.value;
  }
}
