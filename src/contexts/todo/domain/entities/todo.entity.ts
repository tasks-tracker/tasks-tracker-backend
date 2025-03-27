import {
  TodoDescriptionVO,
  TodoIdVO,
  TodoTitleVO,
} from '@contexts/todo/domain/value-objects';

export class Todo {
  constructor(
    public readonly id: TodoIdVO,
    public readonly title: TodoTitleVO,
    public readonly description: TodoDescriptionVO,
    public readonly completed: boolean,
    public readonly isDeleted: boolean,
  ) {}
}
