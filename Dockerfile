FROM node:latest AS build

WORKDIR /build

COPY . .

RUN npm install
RUN npm run build

FROM node:latest AS prod

WORKDIR /app

COPY --from=build ./build/build .

RUN node index.js