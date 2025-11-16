BikeNest - Node + Express + Bootstrap + PostgreSQL (Neon-ready)

Quick start (local dev):
1. Install deps and run (from backend):
   cd backend
   npm install
   # create a .env file (copy from .env.example) and set PG_URI
   npm run migrate     # creates tables if missing
   npm run dev

2. Open http://localhost:3000

Neon deployment notes:
- Create a Neon DB and user. Use the connection string provided by Neon and set it in backend/.env as PG_URI.
- Example PG_URI (URL-encoded password so that '@' works): 
  postgres://bikenest_user:Yogi705544%40@<NEON_HOST>/<DBNAME>

Files created:
- backend/server.js (Express server)
- backend/config/db.js (PG connection)
- backend/migrations/run_migrations.js (creates tables)
- backend/routes (vehicles, bookings, admin)
- public/ (Bootstrap frontend)
- backend/.env.example (PG_URI example)

Demo admin credentials (seeded by migration): admin / admin123
