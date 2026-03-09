FROM node:20-alpine

WORKDIR /app

COPY package.json package-lock.json ./
COPY frontend/package.json frontend/
RUN npm ci --workspace=frontend --ignore-scripts

COPY frontend/ .

# Disable Next.js telemetry
ENV NEXT_TELEMETRY_DISABLED=1

EXPOSE 3000

CMD ["sh", "-c", "cd frontend && npm run dev"]
