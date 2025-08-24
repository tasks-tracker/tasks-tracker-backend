import { Query } from '@nestjs/cqrs';

export class ExistByUserIdQuery extends Query<boolean> {
  constructor(public readonly userId: string) {
    super();
  }
}
