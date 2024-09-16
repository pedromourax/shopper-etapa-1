# Use a imagem oficial do Node.js como base
FROM node:18.13.0-alpine AS builder

WORKDIR /usr/src/app

# Copie os arquivos necessários
COPY package*.json ./
RUN npm install

# Copie o restante do código da aplicação
COPY . .

# Comando para build (dependendo do seu projeto)
RUN npm run build

# Etapa final
FROM node:18.13.0-alpine

WORKDIR /usr/src/app

COPY --from=builder /usr/src/app .

EXPOSE 3000
CMD ["npm", "run", "start:prod"]
