import { ValidationException } from '../../../../libs';
import { validateSync } from 'class-validator';
import { IsString } from 'class-validator';
import { Length } from 'class-validator';

export class LoginVO {
  @Length(3, 50)
  @IsString()
  public readonly value: string;
  constructor(value: string) {
    this.value = value;
    const validationErrors = validateSync(this);
    if (validationErrors.length > 0) {
      throw new ValidationException(validationErrors);
    }
  }
}
