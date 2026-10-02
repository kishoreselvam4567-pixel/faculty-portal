# Faculty Portals — College LMS Faculty Module

A comprehensive, production-ready Faculty Module for College Learning Management Systems (LMS) built with React, TypeScript, Tailwind CSS, Node.js, Express, Prisma ORM, Supabase PostgreSQL, and Firebase Authentication.

---

## 🌟 Features

- **Faculty Workspace & Dashboard**: Real-time institutional overview, profile summary, department metrics, and current academic terms.
- **Class Incharge Management**: Dynamic detection of Class Incharge responsibility derived directly from database class assignments.
- **Student Roster & Verification**: Authorized access to view and verify student profiles enrolled in assigned classes.
- **Department Curriculum & Subjects**: Department degree programs, courses, credit allocations, and semester-level filtering.
- **Academic Calendar**: College academic years, term milestones, and semester dates.
- **Role-Based Security**: Strict backend verification (`FACULTY` / `HOD` roles) and scoped data authorization.

---

## 🛠️ Tech Stack

### Frontend
- **Framework**: React 19 + TypeScript + Vite
- **State Management**: Redux Toolkit
- **Routing**: React Router DOM v7
- **Styling**: Tailwind CSS + Glassmorphism Theme
- **Icons**: Lucide React

### Backend
- **Runtime**: Node.js + Express.js + TypeScript
- **ORM**: Prisma ORM
- **Database**: Supabase PostgreSQL (via Connection Pooler)
- **Authentication**: Firebase Admin SDK

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js (v18+)
- npm (v9+)

### 2. Environment Configuration
Create a `.env` file in the `backend/` directory:
```env
PORT=5000
NODE_ENV=development
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"
FIREBASE_PROJECT_ID="your-project-id"
FIREBASE_CLIENT_EMAIL="firebase-adminsdk@your-project.iam.gserviceaccount.com"
FIREBASE_PRIVATE_KEY="-----BEGIN PRIVATE KEY-----\n...\n-----END PRIVATE KEY-----\n"
```

### 3. Install Dependencies
```bash
# Install root, backend, and frontend dependencies
npm install --prefix backend
npm install --prefix frontend
```

### 4. Run Development Servers
```bash
# Run both Backend (Port 5000) and Frontend (Port 5173) concurrently
npm run dev
```

---

## 📁 Repository Structure

```text
├── backend/
│   ├── prisma/
│   │   └── schema.prisma        # College LMS Prisma Schema
│   ├── src/
│   │   ├── lib/                 # Prisma & Firebase clients
│   │   ├── middleware/          # Auth & Role middleware
│   │   ├── modules/faculty/     # Faculty module (controller, service, repository, routes, types)
│   │   └── index.ts             # Express server entrypoint
│   └── package.json
│
├── frontend/
│   ├── src/
│   │   ├── layouts/             # Navigation & layout components
│   │   ├── modules/faculty/     # Faculty pages, components, api client, and Redux slice
│   │   ├── store/               # Redux Toolkit store
│   │   └── App.tsx              # Application router
│   └── package.json
│
├── .gitignore
├── package.json                 # Root script runner
└── README.md
```
