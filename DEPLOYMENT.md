# CI/CD Pipeline для Task Tracker Backend

## Обзор

Этот проект использует GitHub Actions для автоматической сборки, тестирования и деплоя Docker образов. Пайплайн состоит из трех основных этапов:

1. **Build and Test** - сборка и тестирование приложения
2. **Deploy to Production** - деплой на продакшн сервер
3. **Health Check** - проверка работоспособности приложения

## Требования

### GitHub Secrets

Для работы пайплайна необходимо настроить следующие секреты в репозитории:

```bash
# Основные секреты для деплоя
SERVER_HOST          # IP адрес или домен сервера
SERVER_USERNAME      # Имя пользователя для SSH подключения
SERVER_SSH_KEY       # Приватный SSH ключ для подключения к серверу
SERVER_PORT          # SSH порт (обычно 22)

# Секреты для базы данных
POSTGRES_USER        # Имя пользователя PostgreSQL
POSTGRES_PASSWORD    # Пароль PostgreSQL
POSTGRES_DB          # Имя базы данных

# URL приложения для health check
APP_URL              # URL приложения (например, https://yourdomain.com)
```

### Настройка SSH ключей

1. Сгенерируйте SSH ключ на вашем компьютере:
```bash
ssh-keygen -t ed25519 -C "github-actions"
```

2. Добавьте публичный ключ на сервер:
```bash
ssh-copy-id -i ~/.ssh/id_ed25519.pub username@server_ip
```

3. Добавьте приватный ключ в GitHub Secrets как `SERVER_SSH_KEY`

## Структура файлов

```
.github/workflows/
├── docker-build.yml          # Основной workflow
├── docker-compose.prod.yml   # Продакшн конфигурация
└── nginx/
    └── nginx.conf           # Конфигурация nginx
```

## Как это работает

### 1. Build and Test Job

- Запускается при каждом push и pull request
- Устанавливает зависимости и запускает тесты
- Собирает приложение
- Создает Docker образ с тегами:
  - `latest` для основной ветки
  - `{branch}-{commit}` для feature веток
  - `pr-{number}` для pull requests

### 2. Deploy to Production Job

- Запускается только при push в master/main
- Подключается к серверу по SSH
- Клонирует репозиторий
- Создает .env файл с продакшн переменными
- Останавливает старые контейнеры
- Запускает новые контейнеры
- Проверяет статус деплоя

### 3. Health Check Job

- Проверяет доступность приложения после деплоя
- Выполняет повторные попытки при неудаче
- Логирует результаты проверки

## Локальная разработка

### Запуск в dev режиме

```bash
# Запуск всех сервисов
docker-compose up -d

# Просмотр логов
docker-compose logs -f backend

# Остановка
docker-compose down
```

### Сборка образа локально

```bash
# Сборка образа
docker build -t task-tracker-backend:local .

# Запуск контейнера
docker run -p 8000:8000 task-tracker-backend:local
```

## Продакшн деплой

### Автоматический деплой

Просто сделайте push в ветку `master` или `main`:

```bash
git add .
git commit -m "feat: новая функциональность"
git push origin master
```

GitHub Actions автоматически:
1. Соберет и протестирует приложение
2. Создаст Docker образ
3. Задеплоит на сервер
4. Проверит работоспособность

### Ручной деплой

Если нужно развернуть вручную:

```bash
# На сервере
cd /root/task-tracker-backend
git pull origin master
docker-compose -f docker-compose.prod.yml up -d
```

## Мониторинг

### Логи

```bash
# Логи backend
docker-compose -f docker-compose.prod.yml logs -f backend

# Логи nginx
docker-compose -f docker-compose.prod.yml logs -f nginx

# Логи базы данных
docker-compose -f docker-compose.prod.yml logs -f database
```

### Статус сервисов

```bash
# Статус всех контейнеров
docker-compose -f docker-compose.prod.yml ps

# Health check
curl http://localhost:8000/health
```

## Troubleshooting

### Проблемы с деплоем

1. **SSH подключение не работает**
   - Проверьте правильность SSH ключа в GitHub Secrets
   - Убедитесь, что публичный ключ добавлен на сервер

2. **Приложение не запускается**
   - Проверьте логи: `docker-compose -f docker-compose.prod.yml logs backend`
   - Убедитесь, что все переменные окружения установлены

3. **База данных недоступна**
   - Проверьте статус PostgreSQL контейнера
   - Убедитесь, что переменные DB корректны

### Откат к предыдущей версии

```bash
# На сервере
cd /root/task-tracker-backend
git checkout HEAD~1
docker-compose -f docker-compose.prod.yml up -d
```

## Безопасность

- Все секреты хранятся в GitHub Secrets
- SSH ключи не коммитятся в репозиторий
- Nginx настроен с базовыми заголовками безопасности
- Rate limiting для API endpoints
- SSL/TLS для HTTPS соединений

## Производительность

- Docker layer caching для ускорения сборки
- Multi-platform сборка (amd64, arm64)
- Gzip сжатие для статических файлов
- Оптимизированные настройки nginx
