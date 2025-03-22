import { AggregateRoot } from '@nestjs/cqrs';
import { UserIdVO } from '../value-objects';
import { LoginVO } from '../value-objects';
import { PasswordHashVO } from '../value-objects';
import { UserRegisteredByLoginEvent } from '../events';

export class User extends AggregateRoot {
  #id: UserIdVO;
  #login: LoginVO;
  #passwordHash: PasswordHashVO;
  #registeredAt: Date;
  constructor(
    id: UserIdVO,
    login: LoginVO,
    passwordHash: PasswordHashVO,
    registeredAt: Date,
  ) {
    super();
    this.#id = id;
    this.#login = login;
    this.#passwordHash = passwordHash;
    this.#registeredAt = registeredAt;
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

  static registerByLogin(
    id: UserIdVO,
    login: LoginVO,
    passwordHash: PasswordHashVO,
  ) {
    const currentDate = new Date();
    const user = new User(id, login, passwordHash, currentDate);
    user.apply(new UserRegisteredByLoginEvent(id));
    return user;
  }
}
