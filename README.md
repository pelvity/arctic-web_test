# Mini Snippet Vault 🚀

A high-performance, polished service for saving and searching useful code snippets, links, and commands. Built with **Next.js (App Router)**, **NestJS**, and **MongoDB**.

---

## 🛠 Tech Stack

- **Frontend**: Next.js 14, Tailwind CSS, SWR, Axios, Lucide React, Playwright.
- **Backend**: NestJS, Mongoose, Class-Validator, MongoDB.
- **Environment**: TypeScript, Husky, Lint-staged, EditorConfig.

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v20+ recommended, v18+ supported)
- Docker & Docker Compose (for MongoDB)

### 2. Infrastructure (MongoDB)
Start the database using Docker:
```bash
docker-compose up -d
```
*(If you don't have Docker, ensure MongoDB is running on localhost:27017)*

### 3. Installation
Clone the repository and install dependencies from the root:
```bash
npm install
```

### 3. Environment Setup
Copy the example files and fill in your connection strings:
```bash
cp frontend/.env.example frontend/.env
cp backend/.env.example backend/.env
```

Default values in `.env`:
- `MONGODB_URI`: `mongodb://localhost:27017/mini-snippet-vault`
- `PORT`: `4000`
- `NEXT_PUBLIC_API_URL`: `http://localhost:4000`

### 4. Running the Application (Development)
You can launch both the frontend and backend simultaneously from the root:
```bash
npm run dev
```
- **Frontend**: [http://localhost:3000](http://localhost:3000)
- **Backend API**: [http://localhost:4000](http://localhost:4000)

*Or use the **VS Code "Run All (Dev)" task** (Cmd/Ctrl + Shift + B).*

---

## 🧪 Testing

### Backend (Jest + MongoDB Memory Server)
Isolated integration tests for CRUD and Search:
```bash
npm test -w backend
```

### Frontend (Playwright)
End-to-end user flow testing:
```bash
npm run test -w frontend
```

---

## 📡 API Documentation

### Snippets Endpoints

| Method | Endpoint | Description | Query Params |
|--------|----------|-------------|--------------|
| GET | `/snippets` | List all snippets | `page`, `limit`, `q` (search), `tag` |
| GET | `/snippets/:id` | Get snippet by ID | - |
| POST | `/snippets` | Create a snippet | - |
| PATCH | `/snippets/:id`| Update a snippet | - |
| DELETE | `/snippets/:id`| Delete a snippet | - |

**Example Search Request:**
`GET http://localhost:4000/snippets?q=docker&tag=devops`

---

## 🏗 Production Build

To build and start the production-ready application:
```bash
# Build both apps
npm run build -w frontend
npm run build -w backend

# Start production servers
npm run start -w frontend
npm run start -w backend
```

---

## 📝 Project Structure
```text
.
├── frontend/          # Next.js App Router (UI & E2E Tests)
├── backend/           # NestJS REST API (Logic & Mongoose)
├── package.json       # Root Workspace Configuration
├── .github/workflows/ # CI Pipeline
└── README.md
```

---

## 💡 Notes for Reviewers
- **Strict Validation**: All API inputs are validated via `class-validator`.
- **Performance**: MongoDB text indexes are used for the `q` search query.
- **UX**: The UI follows a premium dark theme logic with loading/empty states and responsive design.
- **Testing**: Includes both backend isolated integration tests and frontend E2E tests.
