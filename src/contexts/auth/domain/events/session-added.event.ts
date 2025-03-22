import type { SessionIdVO } from "../value-objects";

export class SessionAddedEvent {
  constructor(readonly sessionId: SessionIdVO) { }
}
