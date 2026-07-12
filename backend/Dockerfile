ARG NODE_VERSION=24.12.0-alpine

FROM node:${NODE_VERSION}

WORKDIR /app

COPY package*.json ./

RUN npm install

COPY --chown=node:node . .

EXPOSE 3000

ENV HOST=0.0.0.0 PORT=3000

CMD ["node", "index.js"]