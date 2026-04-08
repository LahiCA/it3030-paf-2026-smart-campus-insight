# Smart Campus Operations Hub

Full-stack reference implementation for IT3030 PAF (Spring Boot REST API + React client): facilities catalogue, booking workflow with conflict detection, incident tickets with attachments and comments, in-app notifications, Google OAuth + JWT, analytics for admins, and GitHub Actions CI.

## Prerequisites

- **JDK 17+** and **Maven** (or use `backend/mvnw`)
- **MySQL 8** (local or Docker) — create database `smartcampus` or rely on `createDatabaseIfNotExist`
- **Node.js 20+** (for the React app)
- **Google Cloud OAuth 2.0** “Web application” client ID (for sign-in)

## Backend (`backend/`)

1. Create MySQL database/user or adjust `backend/src/main/resources/application.yaml` (`spring.datasource.*`).
2. Set environment variables (or edit YAML):

   - `GOOGLE_CLIENT_ID` — same as the frontend Google client ID
   - `JWT_SECRET` — at least 32 bytes of random data in production
   - `ADMIN_EMAILS` — comma-separated emails that should receive `ADMIN` on first Google login (optional)

3. Run:

   ```bash
   cd backend
   ./mvnw spring-boot:run
   ```

   API base URL: `http://localhost:8080`

4. Public health check: `GET /api/public/health`

## Frontend (`smart-campus-frontend/`)

1. Copy `smart-campus-frontend/.env.example` to `smart-campus-frontend/.env` and set `VITE_GOOGLE_CLIENT_ID` to your Google OAuth client ID (must match `app.google.client-id` on the server).

2. Install and run:

   ```bash
   cd smart-campus-frontend
   npm install
   npm run dev
   ```

   App: `http://localhost:5173` (Vite proxies `/api` to `http://localhost:8080`).

## Features (assignment alignment)

- **REST API**: Layered architecture (controllers, services, repositories, DTOs, mappers), validation, global error handling, JWT security, role-based access (`USER`, `ADMIN`, `TECHNICIAN`).
- **Bookings**: `PENDING → APPROVED/REJECTED`, cancel, overlap rule `new_start < existing_end && new_end > existing_start` for `PENDING`/`APPROVED`.
- **Tickets**: Workflow including `REJECTED` for admins; up to three image attachments per ticket; comments with edit/delete rules.
- **Notifications**: Stored in DB; UI bell + notifications page.
- **OAuth**: `POST /api/auth/google` with Google ID token → JWT for API calls.
- **Innovation**: Analytics endpoints (`/api/analytics/*`), email hooks via Spring Mail (configure SMTP), calendar view (`react-big-calendar`), dark mode (theme context + `localStorage`).

## GitHub Actions

Workflow `.github/workflows/ci.yml` builds/tests the backend and builds the frontend on pushes/PRs to `main` and `dev`.

## Submission zip

Exclude `node_modules`, `target`, `dist`, and local `.env` when zipping for submission.

## AI disclosure

If you use AI-assisted tooling, document it in your report and progress reviews per course rules.
