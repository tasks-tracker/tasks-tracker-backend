import type { UserIdVO } from '../../domain';
import type { ToDoQuery } from '../query-repositories';
import { Query } from '@nestjs/cqrs';

import { validateSync } from 'class-validator';
import { IsInt } from 'class-validator';
import { Min } from 'class-validator';
import { Max } from 'class-validator';
import { ValidationException } from '@libs/validation-exception';

export class GetPaginationTodoForUserLimit {
  @Max(15)
  @Min(1)
  @IsInt()
  public readonly value: number;
  constructor(value: number) {
    this.value = value;
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new ValidationException(errors);
    }
  }
}

export class GetPaginationTodoForUserOffset {
  @Min(0)
  @IsInt()
  public readonly value: number;
  constructor(value: number) {
    this.value = value;
    const errors = validateSync(this);
    if (errors.length > 0) {
      throw new ValidationException(errors);
    }
  }
}

export class GetPaginationTodoForUserQuery extends Query<Array<ToDoQuery>> {
  constructor(
    public readonly userId: UserIdVO,
    public readonly limit: GetPaginationTodoForUserLimit,
    public readonly offset: GetPaginationTodoForUserOffset,
  ) {
    super();
  }
}
