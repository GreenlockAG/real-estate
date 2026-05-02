# portfolio-app

Full-stack portfolio application built with React + Express.

## Run In GitHub Codespaces

1. Open the repository in Codespaces. The dev container installs dependencies automatically.
2. Start the app from the repository root:

```bash
./start_app
```

3. Open the forwarded port 5000 in the browser.

### Database

- If DATABASE_URL is set, the app uses PostgreSQL (Neon via Drizzle).
- If DATABASE_URL is not set, the app runs with in-memory storage for local development.
