import { UserIdVO } from "../value-objects";

export class UserRegisteredByLoginEvent {
  constructor(
    public readonly id: UserIdVO,
  ) { }
}
