import { IsUrl, IsOptional } from 'class-validator';
import { validateSync } from 'class-validator';
import { ValidationException } from 'libs/validation-exception';

export class AvatarUrlVO {
  @IsUrl()
  @IsOptional()
  public readonly value: string | null;
  constructor(value: string | null) {
    this.value = value;
    if (value !== null) {
      const errors = validateSync(this);
      if (errors.length > 0) {
        throw new ValidationException(errors);
      }
    }
  }

  equals(vo: AvatarUrlVO): boolean {
    return this.value === vo.value;
  }
}
