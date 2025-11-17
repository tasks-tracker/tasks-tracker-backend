FROM node:22-alpine AS builder

WORKDIR /app

COPY package*.json ./
COPY nest-cli.json ./
COPY tsconfig*json ./

RUN npm ci

COPY adapters ./adapters
COPY libs ./libs
COPY apps/auth ./apps/auth
COPY configs ./configs

RUN npm run build auth

FROM node:22-alpine AS production

WORKDIR /app

COPY package*.json ./

RUN npm ci --only=production && npm cache clean --force

COPY --from=builder /app/dist ./dist

COPY --from=builder /app/configs ./configs

RUN addgroup -g 1001 -S nodejs && \
    adduser -S nodejs -u 1001

RUN chown -R nodejs:nodejs /app

USER nodejs

EXPOSE 8000

ENV ENV_PATH=./configs/backend/dev.env
ENV NODE_ENV=production

CMD ["node", "dist/apps/auth/main.js"]
