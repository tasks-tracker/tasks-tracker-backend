export class RegisterUserByLoginEvent {
  constructor(
    public readonly login: string,
    public readonly password: string,
  ) {}
}
