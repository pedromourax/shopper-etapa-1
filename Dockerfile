FROM node:18.13.0-alpine

WORKDIR /app

RUN mkdir -p /app

COPY package.json /app/

RUN npm install

COPY . .

EXPOSE 3000

CMD [ "npm", "run", "start:dev" ]