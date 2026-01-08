# Understanding Environment Files - Simple Explanation

## Frontend (Angular) - 3 Files

### The Files

```
frontend/src/environments/
├── environment.ts              ← The one your code imports
├── environment.development.ts  ← Local development config
└── environment.prod.ts        ← Production (Railway) config
```

### Visual Flow Diagram

```
┌─────────────────────────────────────────────────────────┐
│ Your TypeScript Code (app.component.ts, etc.)          │
│                                                         │
│ import { environment } from './environments/environment'│
│                          ↓                              │
│             Always imports environment.ts               │
└─────────────────────────────────────────────────────────┘
                          ↓
              Angular Build System
                          ↓
        ┌─────────────────┴─────────────────┐
        ↓                                   ↓
   npm start                         npm run build
   (Local Dev)                       (Production)
        ↓                                   ↓
   Replaces with:                     Replaces with:
   environment.development.ts         environment.prod.ts
        ↓                                   ↓
   ┌──────────────────┐              ┌──────────────────┐
   │ production: false│              │ production: true │
   │ apiUrl: localhost│              │ apiUrl: Railway  │
   └──────────────────┘              └──────────────────┘
```

### Step-by-Step Explanation

**1. environment.ts** (The Base File)
- Your code ALWAYS imports this file
- Example: `import { environment } from './environments/environment'`
- This file is like a **placeholder** that gets swapped

**2. environment.development.ts** (Local Development)
- Contains localhost settings
- Used when you run `npm start`
- Angular **secretly replaces** environment.ts with this during development

**3. environment.prod.ts** (Production/Railway)
- Contains production settings
- Used when building for Railway (`npm run build --configuration production`)
- Angular **secretly replaces** environment.ts with this during production build

### Why This Design?

**Problem:** You want different settings for local vs production, but don't want to change imports everywhere.

**Solution:**
- Code imports `environment.ts` (never changes)
- Build system swaps the file based on build mode
- You don't touch your imports!

### Example

**Your component code:**
```typescript
import { environment } from './environments/environment';

export class AppComponent {
  apiUrl = environment.apiUrl;  // Always imports from environment.ts
}
```

**When you run `npm start`:**
- Angular replaces `environment.ts` → `environment.development.ts`
- `apiUrl` becomes `http://localhost:8080`

**When Railway builds:**
- Angular replaces `environment.ts` → `environment.prod.ts`
- `apiUrl` becomes `API_URL_PLACEHOLDER` (then replaced by Docker)

---

## Backend (Spring Boot) - 2 Files

### The Files

```
backend/src/main/resources/
├── application.properties      ← Production (Railway)
└── application-dev.properties  ← Local development
```

### Visual Flow Diagram

```
┌─────────────────────────────────────────────────────┐
│ Spring Boot Application Starts                     │
│                                                     │
│ Which file to load?                                 │
└─────────────────────────────────────────────────────┘
                          ↓
              Check Active Profile
                          ↓
        ┌─────────────────┴─────────────────┐
        ↓                                   ↓
  SPRING_PROFILES_ACTIVE=dev          No profile set
  (You set this locally)              (Railway default)
        ↓                                   ↓
   Loads:                              Loads:
   application-dev.properties          application.properties
        ↓                                   ↓
   ┌──────────────────────┐          ┌──────────────────────┐
   │ port: 8080           │          │ port: ${PORT:8080}   │
   │ database: localhost  │          │ database: ${DB_URL}  │
   │ password: 123456     │          │ password: ${DB_PASS} │
   └──────────────────────┘          └──────────────────────┘
```

### Step-by-Step Explanation

**1. application.properties** (Default/Production)
- Spring Boot loads this by default
- Contains placeholders: `${SPRING_DATASOURCE_URL}`
- Railway provides values via environment variables
- Never loaded locally (because you use `dev` profile)

**2. application-dev.properties** (Local Development)
- Loaded when you set profile to `dev`
- Contains hardcoded localhost values
- Only used on your machine
- Railway never uses this (no `dev` profile set)

### File Naming Convention

Spring Boot uses a naming pattern:
- `application.properties` → Default
- `application-{profile}.properties` → Specific profile
- Examples:
  - `application-dev.properties` → dev profile
  - `application-test.properties` → test profile
  - `application-staging.properties` → staging profile

### How Spring Boot Chooses

**Locally:**
```bash
$env:SPRING_PROFILES_ACTIVE="dev"
mvn spring-boot:run
```
→ Loads `application-dev.properties`

**Railway:**
```
# No profile set
```
→ Loads `application.properties` (default)

---

## Side-by-Side Comparison

| Aspect | Frontend (Angular) | Backend (Spring Boot) |
|--------|-------------------|---------------------|
| **How it works** | File replacement during build | Profile-based selection at runtime |
| **Base file** | `environment.ts` (gets replaced) | `application.properties` (default) |
| **Local file** | `environment.development.ts` | `application-dev.properties` |
| **Production file** | `environment.prod.ts` | `application.properties` |
| **Switching method** | Build command (`npm start` vs `ng build --prod`) | Environment variable (`SPRING_PROFILES_ACTIVE`) |
| **Your code** | Imports `environment.ts` | Reads properties automatically |
| **Number of files** | 3 files | 2 files |

---

## Why Different Approaches?

**Angular (File Replacement):**
- Frontend code is **compiled** into static files
- Configuration must be **baked in** at build time
- Solution: Replace files before compilation

**Spring Boot (Profile Selection):**
- Backend is **runtime** - reads config when it starts
- Can choose files dynamically at startup
- Solution: Select file based on active profile

---

## What You Need to Remember

### Frontend
1. Your code always imports `environment.ts`
2. Build system swaps it automatically
3. You have 3 files but only 1 is used at a time
4. **Commit all 3 files** to Git

### Backend
1. Spring Boot picks file based on profile
2. Set `SPRING_PROFILES_ACTIVE=dev` for local
3. Railway uses default (no profile)
4. **Commit both files** to Git

---

## Quick Test

**Question:** If I change `environment.ts` to use port 9090, will it affect production?

**Answer:**
- ❌ No! Because Railway runs `ng build --configuration production`
- This replaces `environment.ts` with `environment.prod.ts`
- So your change to `environment.ts` is ignored in production
- It only affects default behavior (which we don't use)

**Question:** If I change `application.properties`, will it affect my local development?

**Answer:**
- ❌ No! Because you run with `SPRING_PROFILES_ACTIVE=dev`
- This loads `application-dev.properties`
- So your change to `application.properties` only affects Railway
- Local development ignores it completely

---

## Best Practice Summary

### ✅ DO

1. Commit all environment files to Git
2. Use `npm start` for frontend local dev (uses development config)
3. Use `SPRING_PROFILES_ACTIVE=dev` for backend local dev
4. Keep `environment.ts` as a sensible default (localhost)
5. Keep sensitive data in Railway environment variables

### ❌ DON'T

1. Delete any environment files (you need all of them)
2. Put real secrets in any committed file
3. Try to use production build locally (complicated and unnecessary)
4. Manually edit imports when switching environments
5. Worry about `environment.ts` affecting production (it gets replaced)

---

## Troubleshooting

**Problem:** "My local frontend still uses old API URL"

**Solution:**
- Check `environment.development.ts` (not `environment.ts`)
- Restart `npm start` after changes

**Problem:** "My local backend can't connect to database"

**Solution:**
- Make sure you're using dev profile: `SPRING_PROFILES_ACTIVE=dev`
- Check `application-dev.properties` has correct credentials

**Problem:** "Production uses localhost API!"

**Solution:**
- Check Railway environment variable `API_URL` is set
- Verify `environment.prod.ts` has `API_URL_PLACEHOLDER`
- Check Dockerfile replaces placeholder correctly

---

## Visual Summary

```
LOCAL DEVELOPMENT:
┌──────────────┐         ┌──────────────────────┐
│ Frontend     │         │ Backend              │
│              │         │                      │
│ npm start    │────────▶│ Uses:                │
│              │         │ - environment.dev.ts │
│ Uses:        │         │ - application-dev... │
│ - localhost  │         │ - PROFILES=dev       │
└──────────────┘         └──────────────────────┘

PRODUCTION (Railway):
┌──────────────┐         ┌──────────────────────┐
│ Frontend     │         │ Backend              │
│              │         │                      │
│ ng build     │────────▶│ Uses:                │
│ --prod       │         │ - environment.prod   │
│              │         │ - application.prop   │
│ Uses:        │         │ - Railway env vars   │
│ - Railway    │         │                      │
└──────────────┘         └──────────────────────┘
```
