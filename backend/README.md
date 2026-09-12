# MaanakVerify Backend & REST API Service

Production REST API backend service for the **MaanakVerify** Legal Metrology Verification and Certification Platform.

---

## 1. Architecture

```
Client (Vite + React)
        │
        ▼ HTTP / HTTPS (REST JSON, CORS, Helmet, Rate Limiter)
Express Application (`src/app.ts`)
        │
        ├── Middleware (`src/middleware/`)
        │     ├── authenticate (JWT Bearer Token verification)
        │     ├── requireRole (Role-Based Access Control: Business, Inspector, Admin)
        │     ├── validateBody / validateQuery (Zod Schema Validation)
        │     └── errorHandler (Centralized Error Handler)
        │
        ├── Routes & Controllers (`src/routes/`, `src/controllers/`)
        │     ├── /api/auth           (Registration, Login, Demo Access, Me)
        │     ├── /api/business       (Profiles & Business Information)
        │     ├── /api/instruments    (Instrument Catalog & Specifications)
        │     ├── /api/applications   (Statutory Applications & Scheduling)
        │     ├── /api/inspections    (Field Testing, Checklists & Results)
        │     ├── /api/certificates   (Certificates & Public Verification)
        │     ├── /api/notifications  (User Alerts & Workflow Notices)
        │     ├── /api/dashboard      (Aggregated Analytics & KPIs)
        │     └── /api/public         (Public Unauthenticated Verification)
        │
        ├── Services (`src/services/`)
        │     (Business Logic, RBAC Ownership Enforcement, Transactions)
        │
        └── Database Layer (Prisma ORM)
              └── PostgreSQL / SQLite Engine
```

---

## 2. Requirements

- **Node.js**: `v18+` (Tested on `Node v24.19.0`)
- **npm**: `v9+`
- **Database**: PostgreSQL (Production) or SQLite (`dev.db` for instant local development without local PostgreSQL server setup)

---

## 3. Environment Variables

Create `.env` in the `backend/` root directory (copy from `.env.example`):

```env
PORT=5000
NODE_ENV=development
CLIENT_URL=http://localhost:5173
JWT_SECRET=maanakverify_super_secret_jwt_key_development_2026_metrology
JWT_EXPIRES_IN=7d
DATABASE_URL="file:./dev.db"
FIREBASE_PROJECT_ID=maanakverify
# Optional: Path or inline JSON for production Firebase Admin Service Account Key
# FIREBASE_SERVICE_ACCOUNT_KEY={"type":"service_account",...}
```

### Firebase Console Setup:
1. Create a Firebase project at [console.firebase.google.com](https://console.firebase.google.com).
2. Under **Build > Authentication > Sign-in method**:
   - Enable **Email/Password**.
   - Enable **Google** (provide project support email and save).
3. Under **Project Settings > General > Your apps**, add a Web App and configure keys in the root `.env.local`:
   - `VITE_FIREBASE_API_KEY`
   - `VITE_FIREBASE_AUTH_DOMAIN`
   - `VITE_FIREBASE_PROJECT_ID`
   - `VITE_FIREBASE_STORAGE_BUCKET`
   - `VITE_FIREBASE_MESSAGING_SENDER_ID`
   - `VITE_FIREBASE_APP_ID`
4. Backend token verification validates the Firebase ID token using Google's public JWKS keys automatically matching `FIREBASE_PROJECT_ID`. Optional: download a private service account key under **Project Settings > Service accounts** and set `FIREBASE_SERVICE_ACCOUNT_KEY` for advanced server-side user management.

### For Production with PostgreSQL:
Set your PostgreSQL connection string in `DATABASE_URL`:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/maanakverify?schema=public"
```

---

## 4. Setup & Database Migrations

### Install Dependencies
```bash
npm install
```

### Database Initialization & Migration
```bash
# Push schema to database
npm run prisma:push

# Generate Prisma Client
npm run prisma:generate

# Seed initial accounts & demonstration records
npm run prisma:seed
```

### PostgreSQL Switching
To switch between SQLite and PostgreSQL in Prisma:
- PostgreSQL production schema: `prisma/schema.postgresql.prisma`
- SQLite development schema: `prisma/schema.prisma`

---

## 5. Running the Backend

### Development Mode (with hot-reload)
```bash
npm run dev
```
Runs at: `http://localhost:5000`

### Production Build & Run
```bash
npm run build
npm run start
```

### Run Automated Tests
```bash
npm run test
```
Executes all 18 critical end-to-end integration and RBAC test suites via Vitest and Supertest.

---

## 6. Authentication & Roles (RBAC)

Authentication is handled via standard JSON Web Tokens (JWT). Send the token in the `Authorization` header:
```http
Authorization: Bearer <token>
```

### Roles:
- **`business`**: Can register instruments, submit verification applications, view owned certificates and notifications. Cannot access other businesses' instruments or applications.
- **`inspector`**: Can view assigned field inspections, submit checklist and measurement results, approve/reject verifications. Cannot view other inspectors' assignments.
- **`admin`**: Full oversight. Can assign inspectors, schedule dates, review applications, inspect all businesses and access national compliance analytics.

---

## 7. Demo Accounts

| Role | Email | Password | User ID |
|------|-------|----------|---------|
| **Business** | `rajesh@kumarweighing.in` | `demo1234` | `user_1` |
| **Business 2** | `sunita@mehtameasurements.co.in` | `demo1234` | `user_4` |
| **Inspector** | `priya.sharma@legalmetrology.gov.in` | `demo1234` | `user_2` |
| **Admin** | `vikram.singh@legalmetrology.gov.in` | `demo1234` | `user_3` |

---

## 8. API Endpoints Overview

| Method | Endpoint | Description | Auth / Role |
|--------|----------|-------------|-------------|
| `POST` | `/api/auth/register` | Register user + business | Public |
| `POST` | `/api/auth/login` | Login with email & password | Public |
| `POST` | `/api/auth/demo-login` | Instant demo role access | Public |
| `GET` | `/api/auth/me` | Current authenticated user | Authenticated |
| `GET` | `/api/business/profile` | Current business profile | Business |
| `GET` | `/api/instruments` | Get instruments (scoped) | Authenticated |
| `POST` | `/api/instruments` | Register new instrument | Business |
| `GET` | `/api/applications` | Get applications (scoped) | Authenticated |
| `POST` | `/api/applications` | Create verification application | Business |
| `POST` | `/api/applications/:id/assign-inspector` | Assign inspector & schedule | Admin |
| `GET` | `/api/inspections` | Get inspections (scoped) | Authenticated |
| `POST` | `/api/inspections/:id/submit` | Submit results & issue cert | Assigned Inspector |
| `GET` | `/api/certificates` | List certificates (scoped) | Authenticated |
| `GET` | `/api/public/certificates/verify/:id` | Public verification without login | Public |
| `GET` | `/api/notifications` | User notifications | Authenticated |
| `PATCH`| `/api/notifications/:id/read` | Mark notification read | Authenticated |
| `GET` | `/api/dashboard/stats` | Real database metrics & KPIs | Authenticated |
| `GET` | `/api/health` | Healthcheck endpoint | Public |
