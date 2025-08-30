FROM node:22-alpine AS builder

WORKDIR /app

# Устанавливаем зависимости для сборки нативных модулей
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat \
    && ln -sf python3 /usr/bin/python

# Устанавливаем переменные окружения для оптимизации сборки
ENV NODE_ENV=development
ENV PYTHON=/usr/bin/python
ENV npm_config_python=/usr/bin/python

COPY package*.json .npmrc ./

RUN npm install

COPY . .

RUN npm run build

FROM node:22-alpine AS runner

WORKDIR /app

# Устанавливаем зависимости для сборки нативных модулей (нужны для bcrypt)
RUN apk add --no-cache \
    python3 \
    make \
    g++ \
    libc6-compat \
    && ln -sf python3 /usr/bin/python

# Устанавливаем переменные окружения для оптимизации сборки
ENV PYTHON=/usr/bin/python
ENV npm_config_python=/usr/bin/python

COPY package*.json .npmrc ./

RUN npm install --only=production 

COPY --from=builder /app/dist ./dist

EXPOSE 8000

ENV NODE_ENV=production

CMD ["node", "dist/main"]
