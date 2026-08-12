
# MulticodeIDE

A full-stack code editor platform with React/Vite frontend, Express/MongoDB backend, and local execution support for code projects.

## Features

- React + Vite frontend with Monaco editor integration
- Express backend with JWT-based authentication
- MongoDB data storage for users and projects
- Project creation, editing, and execution
- Local fallback execution support for Python, JavaScript, Bash, C, C++, and Java
- Optional Piston integration via Docker Compose for remote code execution

## Repository structure

- `frontend/` - React application
  - `src/` - frontend source code
    - `App.jsx` - app router and routes
    - `main.jsx` - Vite bootstrap
    - `pages/` - page components
      - `Home.jsx` - project dashboard and editor entry point
      - `Editor.jsx` - code editor and run output
      - `Login.jsx` - login page
      - `SignUp.jsx` - signup page
    - `components/` - reusable UI pieces
    - `helper.js` - shared frontend constants
  - `public/` - static assets
  - `package.json` - frontend dependencies and scripts

- `backend/` - Express API server
  - `routes/` - route definitions
    - `index.js` - API routes and execution proxy
  - `controllers/` - request handlers
    - `userController.js` - auth, project CRUD, and runtime logic
  - `models/` - MongoDB schema definitions
    - `userModel.js`
    - `projectModel.js`
  - `config/` - backend configuration
    - `db.js` - MongoDB connection setup
  - `bin/www` - Express app startup
  - `app.js` - Express app configuration
  - `package.json` - backend dependencies and scripts

- `docker-compose.yml` - combined backend + Piston stack
- `docker-compose.piston.yml` - standalone local Piston service definition
- `docs/RUN_PISTON_LOCALLY.md` - Piston local setup guide

## Prerequisites

- Node.js (18+ recommended)
- npm
- MongoDB running locally at `mongodb://127.0.0.1:27017`
- Optional: Docker Desktop / Docker Compose for local Piston execution
- Optional: compilers/runtimes for local fallback execution
  - Python
  - Node.js
  - GCC / G++ for C/C++
  - Java JDK for Java

## Backend setup

1. Open a terminal at the repo root.
2. Install backend dependencies:
   ```bash
   cd backend
   npm install
   ```
3. Start the backend server:
   ```bash
   npm run dev
   ```

The backend server listens on `http://localhost:3000` by default.

## Frontend setup

1. Open a terminal at the repo root.
2. Install frontend dependencies:
   ```bash
   cd frontend
   npm install
   ```
3. Start the React development server:
   ```bash
   npm run dev
   ```

The frontend is available at the URL shown by Vite, typically `http://localhost:5173`.

## Authentication flow

- Users must sign up first on the `/signUp` page.
- After signup, users are redirected to `/login`.
- On successful login, the app stores a JWT token and the user's full name in `localStorage`.
- The home page greets the logged-in user by name.

## Running code

### Piston integration (recommended)

1. Start the local Piston service:
   ```bash
   docker compose -f docker-compose.piston.yml up -d
   ```
2. Confirm Piston is running:
   ```bash
   curl -I http://localhost:8080/api/v2/runtimes
   ```
3. Set the backend execution URL and start the backend server:

Linux/macOS:
```bash
export PISTON_URL="http://localhost:8080/api/v2/execute"
cd backend
npm run dev
```

Windows PowerShell:
```powershell
$env:PISTON_URL = "http://localhost:8080/api/v2/execute"
cd backend
npm run dev
```

### Local fallback execution

If Piston is unavailable, the backend will attempt local execution for supported languages:

- Python
- JavaScript
- Bash
- C
- C++
- Java

Ensure the required runtime/compiler is installed on the host system.

## Notes

- The backend expects a MongoDB instance at `mongodb://127.0.0.1:27017/codeideIDE`.
- If using the Docker compose stack, the backend service is configured to connect to Piston via `http://piston:8080/api/v2/execute`.
- Error messages are surfaced through the frontend output pane when execution fails.

## Useful commands

```bash
# Backend
cd backend
npm run dev

# Frontend
cd frontend
npm run dev

# Run Piston locally
docker compose -f docker-compose.piston.yml up -d
```

## Troubleshooting

- If the frontend shows `Execution service unavailable`, start Piston or ensure the local runtime/compiler is installed.

- Confirm MongoDB is running:
  ```bash
  mongod --dbpath <your-db-path>
  ```

