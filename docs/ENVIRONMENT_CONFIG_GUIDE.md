# Environment Configuration Guide

## Understanding Environment Files

### How It Works

Angular and Spring Boot use **different files** for local development vs production. The build system automatically swaps them.

---

## Frontend (Angular) Environment Files

### File Structure

```
frontend/src/environments/
├── environment.ts              # Base file (gets replaced)
├── environment.development.ts  # Local development
└── environment.prod.ts        # Production (Railway)
```

### How Angular Switches Environments

**Defined in `angular.json`:**

```json
"fileReplacements": [
  {
    "replace": "src/environments/environment.ts",
    "with": "src/environments/environment.prod.ts"
  }
]
```

### Commands and Which File They Use

| Command | Environment File Used | Purpose |
|---------|----------------------|---------|
| `npm start` or `ng serve` | `environment.development.ts` | Local development |
| `npm run build` or `ng build --configuration production` | `environment.prod.ts` | Production build (Railway) |

### Current Configuration

**environment.development.ts** (Local):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080'
};
```

**environment.prod.ts** (Railway):
```typescript
export const environment = {
  production: true,
  apiUrl: 'API_URL_PLACEHOLDER'  // Replaced by Dockerfile
};
```

**environment.ts** (Base - gets replaced):
```typescript
export const environment = {
  production: false,
  apiUrl: 'http://localhost:8080'
};
```

### Important Notes

- **DO commit all three files** to Git
- `environment.ts` is just a base/default - it gets replaced during build
- Railway Dockerfile replaces `API_URL_PLACEHOLDER` with actual backend URL
- When you run `npm start` locally, it uses `environment.development.ts`
- When Railway builds (`ng build --configuration production`), it uses `environment.prod.ts`

---

## Backend (Spring Boot) Environment Files

### File Structure

```
backend/src/main/resources/
├── application.properties      # Production (Railway)
└── application-dev.properties  # Local development
```

### How Spring Boot Switches Environments

Using **profiles**:

```bash
# Local development
SPRING_PROFILES_ACTIVE=dev

# Production (Railway)
# No profile set, uses default application.properties
```

### Current Configuration

**application-dev.properties** (Local):
```properties
server.port=8080
spring.datasource.url=jdbc:postgresql://localhost:5432/finaldb
spring.datasource.username=postgres
spring.datasource.password=123456
cors.allowed.origins=http://localhost:4200
```

**application.properties** (Railway):
```properties
server.port=${PORT:8080}
spring.datasource.url=${SPRING_DATASOURCE_URL}
cors.allowed.origins=${CORS_ALLOWED_ORIGINS:http://localhost:4200}
```

### Important Notes

- **DO commit both files** to Git
- Railway uses environment variables (from Railway dashboard)
- Locally, you use the `dev` profile with hardcoded values
- The files contain different configurations, no conflict

---

## What to Put in .gitignore

### ❌ DO NOT Ignore (commit these)

```
# Frontend
frontend/src/environments/environment.ts
frontend/src/environments/environment.development.ts
frontend/src/environments/environment.prod.ts

# Backend
backend/src/main/resources/application.properties
backend/src/main/resources/application-dev.properties
```

**Why?** These files don't contain secrets and are needed by the build system.

### ✅ DO Ignore (already in .gitignore)

```
# Build outputs
frontend/dist/
frontend/node_modules/
backend/target/

# IDE files
.idea/
.vscode/
*.iml

# Actual secrets (if you create them)
.env
.env.local
secrets.properties
credentials.json
```

---

## How Environment Switching Works

### Local Development

**Frontend:**
```bash
cd frontend
npm start  # Uses environment.development.ts automatically
```

**Backend:**
```bash
cd backend
$env:SPRING_PROFILES_ACTIVE="dev"; mvn spring-boot:run
# Uses application-dev.properties
```

### Production (Railway)

**Frontend Dockerfile:**
```dockerfile
RUN npm run build -- --configuration production
# This uses environment.prod.ts
# Then Dockerfile replaces API_URL_PLACEHOLDER with $API_URL
```

**Backend:**
```
# Railway sets environment variables:
SPRING_DATASOURCE_URL=jdbc:postgresql://...
SPRING_DATASOURCE_USERNAME=...
SPRING_DATASOURCE_PASSWORD=...
CORS_ALLOWED_ORIGINS=https://frontend-...

# Uses application.properties with these variables
```

---

## Common Scenarios

### Scenario 1: I want to test production build locally

**Frontend:**
```bash
cd frontend
npm run build -- --configuration production
# This creates a production build using environment.prod.ts
# But API_URL_PLACEHOLDER won't be replaced (that's done by Docker)
```

**Solution:** Don't do this. Use `npm start` for local testing.

### Scenario 2: I accidentally committed secrets

```bash
# Remove the file with secrets
git rm --cached path/to/secret-file

# Add to .gitignore
echo "secret-file" >> .gitignore

# Commit
git add .gitignore
git commit -m "Remove secrets from git"
git push
```

**Important:** If credentials were committed, **change them immediately** (database password, API keys, etc.)

### Scenario 3: I want different database for local testing

Edit `application-dev.properties`:
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/test_db
```

This won't affect production (Railway uses `application.properties`).

---

## Summary: What Gets Used When

| Scenario | Frontend File | Backend File |
|----------|--------------|--------------|
| Local dev (`npm start`) | `environment.development.ts` | `application-dev.properties` (with `dev` profile) |
| Production build (Railway) | `environment.prod.ts` | `application.properties` (with Railway env vars) |
| Your code imports | `environment.ts` | `application.properties` |

**Key Point:**
- Frontend: Build system **replaces** `environment.ts` with the appropriate file
- Backend: Spring Boot **selects** which file to load based on active profile
- Both approaches achieve the same goal: different configs for local vs production

---

## Best Practices

1. ✅ **Never hardcode production credentials** in any file
2. ✅ **Use environment variables** for production secrets
3. ✅ **Commit all environment files** (they don't contain secrets)
4. ✅ **Use meaningful placeholders** (like `API_URL_PLACEHOLDER`)
5. ✅ **Document your environment variables** in README
6. ❌ **Don't use production config locally** (use dev profile/files)
7. ❌ **Don't put real secrets in Git** (use environment variables)

---

## Quick Reference

### To Run Locally
```bash
# Backend (use dev profile)
cd backend
$env:SPRING_PROFILES_ACTIVE="dev"; mvn spring-boot:run

# Frontend (automatically uses development config)
cd frontend
npm start
```

### To Deploy (Railway does this automatically)
```bash
# Backend: Uses application.properties with Railway env vars
# Frontend: npm run build --configuration production
#           Uses environment.prod.ts
```

### Files to Commit
- ✅ All `environment*.ts` files
- ✅ All `application*.properties` files
- ✅ Dockerfile, angular.json, pom.xml
- ❌ `.env`, secrets files, credentials

### Files to Ignore (.gitignore)
- node_modules/
- dist/
- target/
- .env
- *.log
- .idea/
- .vscode/
