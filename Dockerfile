FROM node:current AS build

WORKDIR /build

COPY . .

RUN npm install
RUN npm run build

FROM node:current-alpine AS prod

WORKDIR /app

COPY --from=build ./build/build .

CMD ["node","index.js"]