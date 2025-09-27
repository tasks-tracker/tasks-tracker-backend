import { IsString } from 'class-validator';
import { Length } from 'class-validator';
import { Matches } from 'class-validator';
import { validateSync } from 'class-validator';
import { ValidationException } from 'libs/validation-exception';

export class PasswordVO {
  @IsString()
  @Length(3, 25)
  @Matches(
    /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/,
    {
      message:
        'Password must contain at least one lowercase letter, one uppercase letter, one digit, and one special character (@$!%*?&)',
    },
  )
  public readonly value: string;

  constructor(value: string) {
    this.value = value;
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new ValidationException(errors);
    }
  }
}
