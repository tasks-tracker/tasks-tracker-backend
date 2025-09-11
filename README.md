# Task Tracker

## Описание

Task Tracker - это серверное приложение, разработанное с использованием [NestJS](https://nestjs.com/). Оно предназначено для управления задачами и их отслеживания.

## Установка и запуск

### Локальный запуск

1. Установите зависимости:

   ```sh
   npm install
   ```

2. Запустите контейнеры

```sh
 docker compose up -d
```

3. Остановите контейнер бэкенда

```sh
 docker compose down backend
```

4. Раскоментить закоментированное и закомментить незакоммнтированное configs/backend/dev.cors.config.yml 


5. Запустите сервер в режиме разработки:
   ```sh
   npm run start:dev
   ```
6. Запустите миграции

   ```sh
   npm run migration:up
   ```

6. SWAGGER API: http://localhost:8000/swagger

### Запуск с Docker

Чтобы запустить проект с использованием Docker, выполните:

```sh
  docker compose up --build
```

Или минимальный запуск (все внешние зависимости в контейнерах):

```sh
  docker compose up redis database db-migrations zookeeper kafka1
```

Само приложение на хостовой машине:

```sh
npm run start:dev
```

## Скрипты

### Основные команды

- `npm run build` - Сборка проекта
- `npm run start` - Запуск приложения
- `npm run start:dev` - Запуск в режиме разработки
- `npm run start:prod` - Запуск в production-режиме
- `npm run lint` - Проверка кода линтером
- `npm run format` - Форматирование кода

### Тестирование

- `npm run test` - Запуск всех тестов
- `npm run test:watch` - Запуск тестов в watch-режиме
- `npm run test:cov` - Запуск тестов с покрытием
- `npm run test:e2e` - Запуск E2E тестов

### Миграции

- `npm run migration (up|down)` - Запуск миграций
- `npm run migration:dev (up|down)` - Запуск миграций в dev-среде

## Лицензия

Этот проект распространяется под лицензией UNLICENSED.
