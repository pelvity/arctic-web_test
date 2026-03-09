FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json backend/
RUN npm ci --workspace=backend --ignore-scripts

COPY backend/ .

EXPOSE 4000

CMD ["sh", "-c", "cd backend && npm run start:dev"]
