FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json backend/
RUN npm ci --workspace=backend

COPY backend/ .

EXPOSE 4000

CMD ["npm", "run", "start:dev", "--workspace=backend"]
