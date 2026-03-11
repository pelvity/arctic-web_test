FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY backend/package.json backend/
RUN npm ci --workspace=backend --ignore-scripts

COPY backend/ ./backend/
RUN npm run build --workspace=backend

EXPOSE 4000

CMD ["npm", "run", "start:prod", "--workspace=backend"]
