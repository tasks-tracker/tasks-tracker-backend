import type { Result } from "neverthrow";
import type { NotUsedSessionTokenDomainError } from "../../domain";
import type { SessionTokenVO } from "../../domain";

import { Command } from "@nestjs/cqrs";

export class LogoutSessionCommand extends Command<Result<null, NotUsedSessionTokenDomainError>> {
  constructor(
    public readonly sessionToken: SessionTokenVO,
  ) {
    super();
  }
}
