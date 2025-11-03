import { AggregateRoot } from '@nestjs/cqrs';
import { UserIdVO, EmailVO, AvatarUrlVO, NameVO } from '../value-objects';
import { UserProfileUpdatedEvent, UserSettingsUpdatedEvent } from '../events';
import { DomainError } from 'libs/domain-error/domain-error';
import { UserDeletedEvent } from '../events/user-deleted.event';
import { UserAvatarChangedEvent } from '../events/user-avatar-changed.event';
export interface UserSettings {
  notificationsEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
}

export class User extends AggregateRoot {
  #id: UserIdVO;
  #email: EmailVO;
  #firstName: NameVO | null;
  #lastName: NameVO | null;
  #avatarUrl: AvatarUrlVO | null;
  #settings: UserSettings;
  #createdAt: Date;
  #updatedAt: Date;
  #isDeleted: boolean;

  constructor(
    id: UserIdVO,
    email: EmailVO,
    firstName: NameVO | null,
    lastName: NameVO | null,
    avatarUrl: AvatarUrlVO | null,
    settings: UserSettings,
    createdAt: Date,
    updatedAt: Date,
    isDeleted: boolean,
  ) {
    super();
    this.#id = id;
    this.#email = email;
    this.#firstName = firstName;
    this.#lastName = lastName;
    this.#avatarUrl = avatarUrl;
    this.#settings = settings;
    this.#createdAt = createdAt;
    this.#updatedAt = updatedAt;
    this.#isDeleted = isDeleted;
  }

  get id() {
    return this.#id;
  }

  get email() {
    return this.#email;
  }

  get firstName() {
    return this.#firstName;
  }

  get lastName() {
    return this.#lastName;
  }

  get avatarUrl() {
    return this.#avatarUrl;
  }

  get settings() {
    return this.#settings;
  }

  get createdAt() {
    return this.#createdAt;
  }

  get updatedAt() {
    return this.#updatedAt;
  }

  static create(
    id: UserIdVO,
    email: EmailVO,
    firstName: NameVO | null = null,
    lastName: NameVO | null = null,
    avatarUrl: AvatarUrlVO | null = null,
  ): User {
    const now = new Date();
    const defaultSettings: UserSettings = {
      notificationsEnabled: true,
      theme: 'auto',
      language: 'ru',
    };

    const user = new User(
      id,
      email,
      firstName,
      lastName,
      avatarUrl,
      defaultSettings,
      now,
      now,
      false,
    );

    user.apply(new UserProfileUpdatedEvent(id));
    return user;
  }

  updateProfile(firstName: NameVO | null, lastName: NameVO | null) {
    if (firstName && lastName) {
      this.#firstName = firstName;
      this.#lastName = lastName;
      this.apply(new UserProfileUpdatedEvent(this.#id));
    }
    throw new DomainError('INVALID_PROFILE_DATA');
  }

  updateAvatar(avatarUrl: AvatarUrlVO | null) {
    if (avatarUrl) {
      this.#avatarUrl = avatarUrl;
      this.apply(new UserAvatarChangedEvent(this.#id, avatarUrl));
    }
    throw new DomainError('INVALID_AVATAR_URL');
  }

  updateSettings(settings: UserSettings) {
    if (settings) {
      this.#settings = settings;
      this.apply(new UserSettingsUpdatedEvent(this.#id, this.#settings));
    }
    throw new DomainError('INVALID_SETTINGS');
  }

  delete() {
    if (this.#isDeleted) {
      throw new DomainError('USER_ALREADY_DELETED');
    }
    this.#isDeleted = true;
    this.apply(new UserDeletedEvent(this.#id));
    return this;
  }
}
