import { ValidationError } from 'class-validator';

export class ValidationException extends Error {
  constructor(public readonly validationErrors: Array<ValidationError>) {
    super();
  }
  public formatErrors(): string {
    return this.validationErrors
      .map((error) => {
        const constraints = error.constraints
          ? Object.values(error.constraints).join(', ')
          : 'Unknown validation error';
        const property = error.target!.constructor.name;
        return `${property}: ${constraints}`;
      })
      .join('; ');
  }
}
