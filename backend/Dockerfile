FROM node:20-alpine
WORKDIR /app
COPY package*.json ./
RUN pnpm ci --omit=dev
COPY src ./src
EXPOSE 4000
CMD ["node", "src/index.js"]
