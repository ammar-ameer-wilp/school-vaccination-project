# School Vaccination Portal – Backend

This is the backend API for the **School Vaccination Portal** project. It manages users, students, vaccination drives, and registrations via a secure RESTful interface.

---

## Tech Stack

- Node.js + Express
- PostgreSQL
- Docker + Docker Compose
- Swagger for API docs
- ESLint + Prettier

---

## Run with Docker

Run this command from the root directory.
```bash
docker-compose up --build
```

# Run migration script inside container (or locally)
```bash 
node src/db/runMigrations.js
```

# API Endpoints

Endpoints are added in **docs/swagger.yaml** file.
