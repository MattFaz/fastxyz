# use node alpine image as build image
FROM node:lts-alpine

# create work directory in app folder
WORKDIR /app

# install build dependencies for better-sqlite3
RUN apk add --no-cache python3 make g++

# copy over files
COPY package.json package-lock.json* /app/

# install all dependencies
RUN npm ci

# copy over all files to the work directory
COPY ./src /app/src

# expose the host and port 3001 to the server
EXPOSE 3000

# start the app
CMD ["node", "src/index.js"]
