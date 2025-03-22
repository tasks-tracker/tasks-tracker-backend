import type { SessionIdVO } from "../value-objects";
import type { SessionTokenVO } from "../value-objects";

export class Session {
  constructor(
    public readonly id: SessionIdVO,
    public readonly token: SessionTokenVO,
    public readonly expiresAt: Date,
  ) { }
}
