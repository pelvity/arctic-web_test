FROM node:18-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend/package.json frontend/
RUN npm ci --workspace=frontend

COPY frontend/ .

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

CMD ["npm", "run", "dev", "--workspace=frontend"]
