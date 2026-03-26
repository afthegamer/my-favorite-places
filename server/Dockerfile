FROM node:25.6.1-alpine3.23 AS build

WORKDIR /app

COPY package*.json ./

RUN npm ci

COPY . .

RUN npm run build

FROM node:25.6.1-alpine3.23

ENV NODE_ENV=production

RUN apk add --no-cache tini

WORKDIR /app

COPY --chown=node:node package*.json ./

RUN npm ci --omit=dev && npm cache clean --force

COPY --chown=node:node --from=build /app/dist ./dist

USER node

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]

CMD ["node", "dist/index.js"]
