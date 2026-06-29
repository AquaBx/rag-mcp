FROM oven/bun:latest AS build

WORKDIR /build


COPY . .

RUN bun install --frozen-lockfile
RUN bun run build

FROM oven/bun:latest AS prod

WORKDIR /app

COPY --from=build ./build/build .

COPY package.json bun.lock ./
RUN bun install --prod --frozen-lockfile

ENV NODE_ENV=production

CMD ["bun","index.js"]