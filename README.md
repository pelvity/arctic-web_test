# Mini Snippet Vault 🚀

A high-performance, polished service for saving and searching useful code snippets, links, and commands. Built with **Next.js (App Router)**, **NestJS**, and **MongoDB**.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS 4, SWR, Axios, Lucide React, Playwright.
- **Backend**: NestJS 11, Mongoose, Class-Validator, MongoDB.
- **Environment**: TypeScript, Husky, Lint-staged.

---

## 🚀 Getting Started

### 1. Prerequisites
- **Node.js v20+ (LTS) Required**
- Docker & Docker Compose (for MongoDB)

### 2. Infrastructure (MongoDB)
Start the database using Docker:
```bash
npm run db:up
```
*(Uses Docker Compose to start a MongoDB instance on port 27017)*

### 3. Installation
Install dependencies from the root (uses workspaces):
```bash
npm install --legacy-peer-deps
```

### 4. Environment Setup
Copy the example files and verify configuration:
```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

### 5. Running the Application (Hybrid Workflow)
The recommended development workflow is to run the database in Docker and the applications locally for the fastest hot-reloading:

```bash
# Start the full environment (Hybrid)
npm run dev:local
```

Other options:
- **Fully Local**: `npm run dev:local` (if MongoDB is running natively).
- **Fully Dockerized**: `npm run dev:docker`.

---

## 🧪 Testing

### Backend (Integration)
```bash
npm test -w backend
```

### Frontend (E2E)
```bash
npm run test -w frontend
```

---

## 📡 API Documentation

### Snippets Endpoints

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | `/snippets` | List all snippets | `page`, `limit`, `q` (search), `tags` |
| GET | `/snippets/:id` | Get snippet by ID | - |
| POST | `/snippets` | Create a snippet | - |
| PATCH | `/snippets/:id`| Update a snippet | - |
| DELETE | `/snippets/:id`| Delete a snippet | - |

**Example Search Request:**
`GET http://localhost:4000/snippets?q=docker&tags=devops`

---

## 🏗 Production Build

```bash
# Build and Start
npm run build
npm run start
```

---

## 📝 Project Structure
```text
.
├── frontend/          # Next.js App Router (UI)
├── backend/           # NestJS REST API (Logic)
├── package.json       # Root Workspace Configuration
└── README.md
```
