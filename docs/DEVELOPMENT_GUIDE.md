# Development Guide

This guide explains how to run the project locally and how it differs from production deployment.

## Running Locally

### Backend (Spring Boot)

The backend is configured to use **PostgreSQL** for both local development and production.

**Prerequisites:**
- PostgreSQL installed and running locally
- Database created: `finaldb`
- Default credentials: username=`postgres`, password=`123456`
  - Update in `application-dev.properties` if your credentials differ

**To run the backend:**

```bash
cd backend

# PowerShell
$env:SPRING_PROFILES_ACTIVE="dev"; mvn spring-boot:run

# CMD
set SPRING_PROFILES_ACTIVE=dev && mvn spring-boot:run
```

Or in your IDE, set the active profile to `dev`:
- **IntelliJ IDEA**: Edit Run Configuration → Active profiles: `dev`
- **VS Code**: Add environment variable `SPRING_PROFILES_ACTIVE=dev`

The backend will start on `http://localhost:8080` (configured in application-dev.properties)

### Frontend (Angular)

```bash
cd frontend
npm install
npm start
```

The frontend will start on `http://localhost:4200`

---

## Local vs Production Configuration

### Backend

| Configuration | Local (dev profile) | Production (Railway) |
|--------------|---------------------|---------------------|
| Database | Local PostgreSQL | Railway PostgreSQL |
| Config File | `application-dev.properties` | `application.properties` |
| CORS Origins | `http://localhost:4200` | Frontend Railway URL |
| Database Host | `localhost:5432` | Railway managed |
| Data Persistence | Persistent locally | Persistent on Railway |

### Frontend

| Configuration | Local | Production (Railway) |
|--------------|-------|---------------------|
| API URL | `http://localhost:8080` | Backend Railway URL |
| Port | 4200 | 8080 (nginx) |
| Server | Angular dev server | Nginx |

---

## Git & Deployment Basics

### Understanding Branches

- **main branch**: Your production code that's deployed to Railway
- Currently you're working directly on `main` (simple approach for now)

### Making Changes

1. Make your code changes
2. Test locally using the dev profile
3. Commit when ready:
   ```bash
   git add .
   git commit -m "Description of changes"
   git push
   ```
4. Railway automatically deploys when you push to `main`

### Important Files (Don't Commit)

Already configured in `.gitignore`:
- `node_modules/` - Frontend dependencies
- `target/` - Backend build files
- `.env` - Local environment variables
- `dist/` - Frontend build output

---

## Troubleshooting

### Backend won't start locally
- **Error**: "URL must start with 'jdbc'"
  - **Solution**: Make sure you're running with the `dev` profile
  - Command: `mvn spring-boot:run -Dspring-boot.run.profiles=dev`

### Frontend can't connect to backend
- **Error**: CORS or network error
  - **Solution**:
    1. Ensure backend is running on `http://localhost:8080`
    2. Check `environment.ts` has correct API URL
    3. For local dev, CORS is already configured for `localhost:4200`

### Railway deployment fails
- Check the deployment logs in Railway dashboard
- Common issues:
  - Missing environment variables
  - Build errors (check package.json or pom.xml)
  - Port configuration (backend: 8080, frontend: 8080 for nginx)

---

## Quick Reference

**Start everything locally:**
```bash
# Terminal 1 - Backend
cd backend
mvn spring-boot:run -Dspring-boot.run.profiles=dev

# Terminal 2 - Frontend
cd frontend
npm start
```

**Access locally:**
- Frontend: http://localhost:4200
- Backend API: http://localhost:8080
- PostgreSQL Database: `localhost:5432/finaldb`

**Railway URLs:**
- Frontend: https://frontend-production-67bc.up.railway.app
- Backend: https://backend-production-240f.up.railway.app
