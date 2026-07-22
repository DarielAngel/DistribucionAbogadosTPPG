# Provincia Abogados - Backend

Backend minimal scaffold using Node.js, Express and Sequelize (Postgres).

Setup

1. Copy `.env.example` to `.env` and edit `DATABASE_URL` and `JWT_SECRET`.
2. Install dependencies:

```bash
cd backend
npm install
```

3. Run:

```bash
npm run dev
```

API endpoints (examples)

- `POST /api/auth/register` - register
- `POST /api/auth/login` - login -> returns JWT
- `GET /api/lawyers` - list lawyers (requires auth header)
- `POST /api/lawyers` - create lawyer (admin)
- `GET /api/schedules` - list schedules
