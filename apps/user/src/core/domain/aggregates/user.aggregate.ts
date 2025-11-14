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
  #userId: UserIdVO;
  #avatarUrl: AvatarUrlVO;
  #settings: Settings;
  #createdAt: Date;
  #updatedAt: Date;

  constructor(
    id: UserIdVO,
    userId: UserIdVO,
    avatarUrl: AvatarUrlVO,
    settings: Settings,
    createdAt: Date,
    updatedAt: Date,
  ) {
    super();
    this.#id = id;
    this.#userId = userId;
    this.#avatarUrl = avatarUrl;
    this.#settings = settings;
    this.#createdAt = createdAt;
    this.#updatedAt = updatedAt;
  }

  get id() {
    return this.#id;
  }

  get userId() {
    return this.#userId;
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

  static create(userId: UserIdVO): UserSettings {
    const defaultSettings: Settings = {
      notificationsEnabled: true,
      theme: 'light',
      language: 'ru',
    };

    const id = randomUUID();
    const now = new Date();

    const user = new UserSettings(
      new UserIdVO(id),
      userId,
      new AvatarUrlVO(
        'https://sun9-62.userapi.com/s/v1/ig2/L77CPXsVjZSGit7if9DUP-KDH1KwyKQ_lJZUjO7cuTAf3D0CQVOnPqjTjpToEeAum_foW2v1PVjUTxUcbpsrkTy7.jpg?quality=95&as=32x40,48x60,72x90,108x135,160x200,240x300,360x450,480x600,540x675,640x800,720x900,736x920&from=bu&cs=736x0',
      ),
      defaultSettings,
      now,
      now,
    );

    user.apply(new UserCreatedEvent(userId));
    return user;
  }

  updateAvatar(avatarUrl: AvatarUrlVO | null) {
    if (avatarUrl) {
      this.#avatarUrl = avatarUrl;
      this.apply(new UserAvatarChangedEvent(this.#id, avatarUrl));
    }
    throw new DomainError('INVALID_AVATAR_URL');
  }

  updateSettings(settings: Partial<Settings>) {
    if (Object.keys(settings).length === 0) {
      throw new DomainError('NO_SETTINGS_TO_UPDATE');
    }

    for (const key of Object.keys(settings)) {
      if (key in this.#settings) {
        const value = settings[key as keyof Settings];
        if (value !== undefined) {
          this.#settings[key as keyof Settings] = value as never;
        }
      } else {
        throw new DomainError('INVALID_SETTING_KEY');
      }
    }
    this.apply(new UserSettingsUpdatedEvent(this.#id, this.#settings));
  }
}
