# Check out https://hub.docker.com/_/node to select a new base image
FROM node:16-alpine as builder

# Set to a non-root built-in user `node`
USER node

# Create app directory (with user `node`)
RUN mkdir -p /home/node/app

WORKDIR /home/node/app

# Install app dependencies
# A wildcard is used to ensure both package.json AND package-lock.json are copied
# where available (npm@5+)
COPY --chown=node package.json yarn.lock ./

RUN yarn
# Bundle app source code
COPY --chown=node . .

ENV NODE_ENV=${NODE_ENV}
RUN yarn run build


FROM node:16-alpine

ENV NODE_ENV=production
USER node
WORKDIR /home/node

COPY --from=builder --chown=node:node /home/node/app/package*.json ./
COPY --from=builder --chown=node:node /home/node/app/node_modules/ ./node_modules/
COPY --from=builder --chown=node:node /home/node/app/dist/ ./dist/
COPY --from=builder --chown=node:node /home/node/app/config/ ./config/
COPY --from=builder --chown=node:node /home/node/app/migrations/ ./migrations/
COPY --from=builder --chown=node:node /home/node/app/seeders/ ./seeders/
COPY --from=builder --chown=node:node /home/node/app/models/ ./models/

# Bind to all network interfaces so that it can be mapped to the host OS
ENV HOST=0.0.0.0 PORT=3000
EXPOSE ${PORT}
