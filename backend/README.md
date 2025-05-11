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
```
docker compose up --build
```
---

## Run migration script 

If running the project in local and need to setup the db, run the below command:
``` 
node src/db/runMigrations.js
```
---

## Environment Variables

Add the following environment variables to the .env file:
```
PORT=5000
DATABASE_URL=postgresql://<user>:<password>@db:5432/vaccine_db
```

Note: Replace the `user` and `password` with your actual postgres username and password.

---

## API Endpoints

Endpoints are added in **docs/swagger.yaml** file.
