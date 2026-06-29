FROM oven/bun:1 AS base

# --- Install dependencies ---
FROM base AS deps
WORKDIR /app
COPY package.json bun.lock ./
RUN bun install --frozen-lockfile

# --- Build ---
FROM base AS build
WORKDIR /app
COPY --from=deps /app/node_modules ./node_modules
COPY . .
ENV ADAPTER=node
RUN bun run build

# --- Production ---
FROM base AS production
WORKDIR /app
ENV NODE_ENV=production

COPY --from=build /app/build ./build
COPY --from=build /app/package.json ./
COPY --from=deps /app/node_modules ./node_modules

EXPOSE 3000
CMD ["bun", "build/index.js"]
