# syntax=docker/dockerfile:1

FROM node:22-alpine AS deps
WORKDIR /app
COPY package.json package-lock.json ./
RUN npm ci

FROM node:22-alpine AS builder
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV NEXT_TELEMETRY_DISABLED=1
RUN npm run build

FROM node:22-alpine AS runner
WORKDIR /app
ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0

RUN addgroup -S nodejs && adduser -S nextjs -G nodejs

COPY --from=builder /app/.next/standalone ./
COPY --from=builder /app/.next/static ./.next/static
COPY --from=builder /app/public ./public
# article markdown + OG fonts are read from disk via process.cwd() paths,
# which output tracing cannot detect — copy them explicitly
COPY --from=builder /app/content ./content
COPY --from=builder /app/node_modules/@fontsource/space-grotesk ./node_modules/@fontsource/space-grotesk
COPY --from=builder /app/node_modules/@fontsource/jetbrains-mono ./node_modules/@fontsource/jetbrains-mono

USER nextjs
EXPOSE 3000
CMD ["node", "server.js"]
