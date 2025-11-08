import { AggregateRoot } from '@nestjs/cqrs';
import { UserIdVO, AvatarUrlVO } from '../value-objects';
import { UserCreatedEvent, UserSettingsUpdatedEvent } from '../events';
import { DomainError } from 'libs/domain-error/domain-error';
import { UserAvatarChangedEvent } from '../events/user-avatar-changed.event';
import { randomUUID } from 'crypto';
export interface Settings {
  notificationsEnabled: boolean;
  theme: 'light' | 'dark' | 'auto';
  language: string;
}

export class UserSettings extends AggregateRoot {
  #id: UserIdVO;
  #avatarUrl: AvatarUrlVO;
  #settings: Settings;
  #createdAt: Date;
  #updatedAt: Date;

  constructor(
    id: UserIdVO,
    avatarUrl: AvatarUrlVO,
    settings: Settings,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super();
    this.#id = id;
    this.#avatarUrl = avatarUrl;
    this.#settings = settings;
    this.#createdAt = createdAt;
    this.#updatedAt = updatedAt;
  }

  get id() {
    return this.#id;
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

  static create(avatarUrl: AvatarUrlVO): UserSettings {
    const defaultSettings: Settings = {
      notificationsEnabled: true,
      theme: 'auto',
      language: 'ru',
    };

    const userId = randomUUID();
    const now = new Date();

    const user = new UserSettings(
      new UserIdVO(userId),
      avatarUrl,
      defaultSettings,
      now,
      now,
    );

    user.apply(new UserCreatedEvent(new UserIdVO(userId)));
    return user;
  }

  updateAvatar(avatarUrl: AvatarUrlVO | null) {
    if (avatarUrl) {
      this.#avatarUrl = avatarUrl;
      this.apply(new UserAvatarChangedEvent(this.#id, avatarUrl));
    }
    throw new DomainError('INVALID_AVATAR_URL');
  }

  updateSettings(settings: Settings) {
    if (settings) {
      this.#settings = settings;
      this.apply(new UserSettingsUpdatedEvent(this.#id, this.#settings));
    }
    throw new DomainError('INVALID_SETTINGS');
  }
}
