import { AggregateRoot } from '@nestjs/cqrs';
import { UserIdVO } from '../value-objects';
import { LoginVO } from '../value-objects';
import { PasswordHashVO } from '../value-objects';
import { UserRegisteredByLoginEvent } from '../events';
import { SessionAddedEvent } from '../events';
import { Session } from '../entities';

export class User extends AggregateRoot {
  #id: UserIdVO;
  #login: LoginVO;
  #passwordHash: PasswordHashVO;
  #registeredAt: Date;
  #sessions: Session[];
  constructor(
    id: UserIdVO,
    login: LoginVO,
    passwordHash: PasswordHashVO,
    registeredAt: Date,
    sessions: Session[]
  ) {
    super();
    this.#id = id;
    this.#login = login;
    this.#passwordHash = passwordHash;
    this.#registeredAt = registeredAt;
    this.#sessions = sessions;
  }

  get id() {
    return this.#id;
  }

  get login() {
    return this.#login;
  }

  get passwordHash() {
    return this.#passwordHash;
  }

  get registeredAt() {
    return this.#registeredAt;
  }

  get sessions() {
    return this.#sessions;
  }

  static registerByLogin(
    id: UserIdVO,
    login: LoginVO,
    passwordHash: PasswordHashVO,
  ) {
    const currentDate = new Date();
    const user = new User(id, login, passwordHash, currentDate, []);
    user.apply(new UserRegisteredByLoginEvent(id));
    return user;
  }

  addSession(session: Session) {
    this.apply(new SessionAddedEvent(session.id));
    this.#sessions.push(session);
  }
}
