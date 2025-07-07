FROM node:22-alpine AS etapa0

WORKDIR /usr/app

COPY ./dist ./dist
COPY ./package*.json ./
RUN npm install --only=production

EXPOSE 4013

CMD ["node", "dist/main.js"]