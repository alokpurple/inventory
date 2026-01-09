# Railway Deployment Branching Strategy

**A Temporary Git Workflow for Railway Deployment (While Learning AWS)**

---

## Executive Summary

### 🎯 Strategy Overview

You want to deploy your project on **Railway temporarily** for demos/testing while keeping the `main` branch clean for future AWS deployment. The solution: Create a **`develop-railway` branch** that acts as a one-way mirror of `develop`.

**Key Principle:** Changes flow **FROM** `develop` **TO** `develop-railway`, but **NEVER** back.

---

### ✅ Pros (Why This Works)

1. **✅ Safe Production Branch**
   - `main` remains untouched and AWS-ready
   - No risk of Railway configs contaminating production

2. **✅ Clear Separation**
   - Railway-specific configs isolated in `develop-railway`
   - Easy to delete when Railway is no longer needed

3. **✅ Flexibility**
   - Can demo features on Railway without affecting main codebase
   - Stakeholders can test while you learn AWS

4. **✅ Simple Mental Model**
   - One-way flow is easy to understand
   - No complex merge rules to remember

---

### ❌ Cons (Potential Problems)

1. **❌ Branch Drift**
   - Over time, `develop-railway` may drift far from `develop`
   - Syncing becomes harder the longer you wait

2. **❌ Duplicate Effort**
   - Bug fixes in `develop-railway` must be manually applied to `develop`
   - Can't automatically merge back

3. **❌ Confusion Risk**
   - New contributors might not understand the one-way flow
   - Accidental merges could contaminate `develop`

4. **❌ Maintenance Overhead**
   - Need to regularly sync from `develop`
   - Conflicts must be resolved manually

---

### ⚠️ Risks (What Could Go Wrong)

| Risk | Likelihood | Impact | Mitigation |
|------|------------|--------|------------|
| **Accidental merge to `develop`** | Medium | High | Branch protection rules + checklist |
| **Forgetting to sync updates** | High | Medium | Weekly calendar reminder |
| **Merge conflicts during sync** | High | Medium | Keep Railway configs in separate files |
| **Railway configs reach `main`** | Low | High | Code review + never merge `develop-railway` to `main` |
| **Losing Railway-specific fixes** | Medium | Low | Document all Railway changes before deletion |

---

### 💡 Improvements (Better Alternatives)

#### Option 1: Environment Variables Only (Recommended)
**Instead of different configs in code:**
- Keep all code identical across branches
- Use environment variables for ALL environment-specific settings
- Only Railway dashboard variables differ, not code

**Benefits:**
- ✅ No branch drift
- ✅ No merge conflicts
- ✅ Same code everywhere

**Implementation:**
```properties
# application.properties (same in all branches)
server.port=${PORT:8080}
database.url=${DATABASE_URL}
```

Then set different values in:
- Railway dashboard for Railway deployment
- AWS console for AWS deployment

#### Option 2: Configuration Files in .gitignore
- Keep environment configs in `.gitignore`
- Each environment has its own config file locally
- No Railway-specific code in Git

---

### 🎯 Viability Assessment

**Is this safe for a Git beginner?**

| Aspect | Rating | Notes |
|--------|--------|-------|
| Safety | 🟡 Medium | Requires discipline to not merge back |
| Complexity | 🟢 Low | One-way flow is simple conceptually |
| Maintenance | 🟡 Medium | Weekly syncs needed |
| Risk to `main` | 🟢 Low | Branch protection prevents accidents |

**Verdict:** ✅ **Viable with safeguards**

**Requirements:**
1. Set up branch protection rules (critical!)
2. Follow checklist before every merge
3. Sync from `develop` at least weekly
4. Delete `develop-railway` as soon as AWS is ready

---

## Visual Branch Diagram

### Complete Branch Flow

```
┌─────────────────────────────────────────────────────────────────────┐
│                         BRANCH LIFECYCLE                             │
└─────────────────────────────────────────────────────────────────────┘

main (AWS Production)
  │
  │ ◄─────────────── Merge only when ready (NOT YET)
  │
develop (Active Development)
  │
  ├─────► feature/user-auth ────► (merge back to develop)
  │
  ├─────► bugfix/login-error ───► (merge back to develop)
  │
  │ ┌─────────────────────────────────────────────────────────────────┐
  │ │                  ONE-WAY SYNC (ALLOWED)                         │
  │ │                         ↓                                       │
  └─┼───────────────────► develop-railway (Railway Deployment)        │
    │                         │                                       │
    │                         │                                       │
    │   Railway-specific ◄────┤                                       │
    │   feature/railway-cors  │                                       │
    │   (merge back to        │                                       │
    │    develop-railway)     │                                       │
    │                         │                                       │
    └─────────────────────────┴───────────────────────────────────────┘
                                      │
                                      ▼
                            Railway Auto-deploys
                            (Live demo environment)


┌─────────────────────────────────────────────────────────────────────┐
│                          MERGE RULES                                │
└─────────────────────────────────────────────────────────────────────┘

✅ ALLOWED MERGES:
  • feature/* ────────────► develop
  • bugfix/* ─────────────► develop
  • develop ──────────────► develop-railway (SYNC ONLY)
  • railway-feature/* ────► develop-railway
  • develop ──────────────► main (WHEN AWS READY)

❌ FORBIDDEN MERGES:
  • develop-railway ──X──► develop (NEVER!)
  • develop-railway ──X──► main (NEVER!)
  • railway-feature/* ──X─► develop (NEVER!)
  • Any direct commits to main (NEVER!)
```

### Timeline View

```
Week 1: Setup
├── Create develop-railway from develop
└── Deploy to Railway

Week 2-N: Regular Development
├── Work on features in develop
├── Sync to develop-railway weekly
└── Demo on Railway

Week N+1: AWS Migration
├── Setup AWS deployment
├── Test main branch on AWS
└── Delete develop-railway

Future: Production
└── Use main branch for AWS only
```

### Branch Relationships

```
                    [main] ◄──────────────────────┐
                      │                           │
                      │ (origin)                  │
                      ▼                           │
                  [develop] ◄───────────┐         │ (when AWS ready)
                      │                 │         │
                      │                 │         │
        ┌─────────────┼─────────────┐   │         │
        │             │             │   │         │
        ▼             ▼             ▼   │         │
  [feature/a]  [feature/b]  [bugfix/c]  │         │
        │             │             │   │         │
        └─────────────┴─────────────┘   │         │
                      │                 │         │
                      │ (merge back)    │         │
                      ▼                 │         │
                  [develop] ────────────┘         │
                      │                           │
                      │ (one-way sync)            │
                      ▼                           │
            [develop-railway] ──────────────────┐ │
                      │                         │ │
        ┌─────────────┼─────────────┐           │ │
        │             │             │           │ │
        ▼             ▼             ▼           │ │
[railway-      [railway-      [railway-         │ │
 feature/x]     feature/y]     config/z]        │ │
        │             │             │           │ │
        └─────────────┴─────────────┘           │ │
                      │                         │ │
                      │ (merge back)            │ │
                      ▼                         │ │
            [develop-railway]                   │ │
                      │                         │ │
                      ▼                         │ │
               Railway Deploys                  │ │
                                                │ │
                                  (NEVER!) ─────┘ │
                                                  │
                                  (NEVER!) ───────┘
```

---

## Complete Workflow Documentation

### A. Initial Setup

#### Step 1: Create `develop-railway` Branch

**When:** Before first Railway deployment

**Commands:**
```bash
# 1. Ensure you're on develop and up-to-date
git checkout develop
git pull origin develop

# 2. Create develop-railway from develop
git checkout -b develop-railway

# 3. Push to remote
git push -u origin develop-railway

# 4. Verify branch was created
git branch -a
# Should show: develop-railway in the list
```

**What this does:**
- Creates an exact copy of `develop` at this moment
- This becomes your Railway deployment source

---

#### Step 2: Configure Railway to Deploy from `develop-railway`

**In Railway Dashboard:**

1. Go to your project on [railway.app](https://railway.app)
2. Click on **Backend service**
3. Go to **Settings** → **Source**
4. Under **Branch**, select: **`develop-railway`**
5. Click **"Save"**
6. Repeat for **Frontend service**

**Result:** Railway now auto-deploys whenever you push to `develop-railway`

---

#### Step 3: Set Up Branch Protection Rules

**On GitHub:**

1. Go to your repository → **Settings**
2. Click **"Branches"** in left sidebar
3. Click **"Add branch protection rule"**

**For `main` branch:**
- Branch name pattern: `main`
- ✅ Check: "Require pull request reviews before merging"
- ✅ Check: "Require status checks to pass before merging"
- ✅ Check: "Do not allow bypassing the above settings"
- Click **"Create"**

**For `develop` branch:**
- Branch name pattern: `develop`
- ✅ Check: "Require pull request reviews before merging" (optional)
- ✅ Check: "Restrict who can push to matching branches"
  - Add yourself and trusted developers only
- Click **"Create"**

**Why this matters:** Prevents accidental merges to protected branches

---

### B. Regular Operations

#### Workflow 1: Syncing Updates from `develop` to `develop-railway`

**When:** Weekly, or after major features land in `develop`

**Before starting, ask yourself:**
1. Are there Railway-specific changes in `develop-railway` that will conflict?
2. Did I commit any Railway configs that need to be preserved?
3. Is this a good time to sync (not in the middle of a Railway demo)?

**Commands:**
```bash
# Step 1: Switch to develop-railway
git checkout develop-railway

# Step 2: Make sure your local develop-railway is up-to-date
git pull origin develop-railway

# Step 3: Merge from develop (this brings in new features)
git merge origin/develop

# ⚠️ If conflicts occur, see "Conflict Management" section below

# Step 4: Test locally (IMPORTANT!)
# Run your application and verify nothing broke
npm start  # frontend
mvn spring-boot:run  # backend

# Step 5: If tests pass, push to Railway
git push origin develop-railway

# Railway will auto-deploy the updated code
```

**Alternative: Cherry-pick specific commits**

If you only want specific features from `develop`:

```bash
# Step 1: View commits in develop
git log develop --oneline -10

# Step 2: Copy commit hashes you want
# Example: abc1234, def5678

# Step 3: Cherry-pick them
git checkout develop-railway
git cherry-pick abc1234
git cherry-pick def5678

# Step 4: Push
git push origin develop-railway
```

**When to cherry-pick vs merge:**
- **Merge:** When you want most/all changes from `develop`
- **Cherry-pick:** When you only want specific features

---

#### Workflow 2: Creating Railway-Specific Feature Branches

**When:** Need to add Railway-only configurations or fixes

**Examples of Railway-only changes:**
- Railway-specific environment variable references
- nginx configuration tweaks for Railway
- Port settings for Railway (8080)
- Railway health check endpoints

**Commands:**
```bash
# Step 1: Create branch from develop-railway
git checkout develop-railway
git pull origin develop-railway
git checkout -b railway-feature/description

# Example:
git checkout -b railway-feature/fix-cors-railway

# Step 2: Make your changes
# Edit files...

# Step 3: Commit
git add .
git commit -m "Fix CORS for Railway deployment"

# Step 4: Push to remote
git push -u origin railway-feature/fix-cors-railway

# Step 5: Create PR on GitHub
# Base: develop-railway ← railway-feature/fix-cors-railway

# Step 6: After PR approved, merge
git checkout develop-railway
git merge railway-feature/fix-cors-railway

# Step 7: Push (Railway auto-deploys)
git push origin develop-railway

# Step 8: Delete feature branch
git branch -d railway-feature/fix-cors-railway
git push origin --delete railway-feature/fix-cors-railway
```

**Branch naming convention:**
- `railway-feature/*` - New Railway-specific features
- `railway-bugfix/*` - Fixes for Railway deployment issues
- `railway-config/*` - Configuration changes for Railway

**Why prefix with "railway-"?**
- Makes it obvious these branches are Railway-specific
- Reminds you NOT to merge to `develop`

---

#### Workflow 3: Regular Feature Development (Not Railway-Specific)

**When:** Developing normal application features

**IMPORTANT:** Always branch from `develop`, not `develop-railway`!

```bash
# Step 1: Create feature branch from develop
git checkout develop
git pull origin develop
git checkout -b feature/user-authentication

# Step 2: Develop feature
# Write code, test locally...

# Step 3: Commit and push
git add .
git commit -m "Add user authentication feature"
git push -u origin feature/user-authentication

# Step 4: Create PR on GitHub
# Base: develop ← feature/user-authentication

# Step 5: After PR merged to develop
git checkout develop
git pull origin develop

# Step 6: Sync to Railway (see Workflow 1)
git checkout develop-railway
git merge origin/develop
git push origin develop-railway
```

**Flow diagram:**
```
You → feature/* → develop → sync → develop-railway → Railway
```

---

### C. Conflict Management

#### Scenario 1: Merge Conflicts During Sync

**What happened:**
You tried to merge `develop` into `develop-railway` and got conflicts.

**Why:**
- Railway-specific configs in `develop-railway` conflict with `develop` changes
- Someone modified the same file in both branches

**Solution:**

```bash
# You'll see:
# CONFLICT (content): Merge conflict in application.properties
# Automatic merge failed; fix conflicts and then commit the result.

# Step 1: Check which files have conflicts
git status

# Step 2: Open conflicting files
# Look for conflict markers:
# <<<<<<< HEAD (your develop-railway changes)
# =======
# >>>>>>> origin/develop (incoming changes)

# Step 3: Resolve conflicts manually
# Edit the file to keep Railway-specific settings

# Example conflict in application.properties:
# <<<<<<< HEAD
# server.port=8080  # Railway-specific
# =======
# server.port=5000  # From develop
# >>>>>>> origin/develop

# Resolution (keep Railway setting):
server.port=8080

# Step 4: Mark as resolved
git add application.properties

# Step 5: Complete the merge
git commit -m "Merge develop to develop-railway, keep Railway configs"

# Step 6: Test before pushing!
# Run application locally

# Step 7: Push if tests pass
git push origin develop-railway
```

---

#### Scenario 2: Detecting Breaking Changes Before Merge

**Before syncing, check what changed:**

```bash
# Step 1: View changes between branches
git diff develop..develop-railway

# Step 2: View commit messages in develop since last sync
git log develop-railway..develop --oneline

# Step 3: Look for changes to config files
git diff develop..develop-railway -- "*.properties" "*.ts"

# Step 4: If changes look risky, test in a temporary branch first
git checkout -b test-merge-develop
git merge origin/develop
# Test...
# If okay, then merge to develop-railway
# If broken, investigate specific commits
```

---

#### Scenario 3: Railway Deployment Broke After Sync

**What happened:**
- Pushed changes to `develop-railway`
- Railway deployed
- Application is broken

**Immediate fix (Rollback):**

```bash
# Step 1: Find last working commit
git log develop-railway --oneline -5

# Example output:
# abc1234 (HEAD) Merge develop to develop-railway  ← BROKEN
# def5678 Fix Railway CORS issue                   ← LAST GOOD
# xyz9012 Add new product feature

# Step 2: Revert to last working commit
git revert abc1234

# OR use reset (rewrites history - be careful!)
git reset --hard def5678

# Step 3: Force push (only for develop-railway, never for develop/main!)
git push --force origin develop-railway

# Railway will redeploy the working version
```

**Long-term fix:**
1. Investigate what broke on a separate branch
2. Fix the issue
3. Test thoroughly
4. Push fixed version

---

### D. Cleanup & Migration (When AWS is Ready)

#### Phase 1: Prepare AWS Deployment

**Week before migration:**

```bash
# Step 1: Ensure main is up-to-date with develop
git checkout main
git pull origin main

git checkout develop
git pull origin develop

# Step 2: Merge develop to main (when ready for AWS)
git checkout main
git merge develop
git push origin main

# Step 3: Deploy main to AWS
# (Follow AWS deployment guide)

# Step 4: Test AWS deployment thoroughly
```

---

#### Phase 2: Archive Railway-Specific Changes

**Before deleting `develop-railway`, document Railway changes:**

```bash
# Step 1: List all Railway-specific commits
git log develop..develop-railway --oneline > railway-changes.txt

# Step 2: Save Railway-specific config files
mkdir railway-archive
git show develop-railway:backend/src/main/resources/application.properties > railway-archive/application.properties
git show develop-railway:frontend/src/environments/environment.prod.ts > railway-archive/environment.prod.ts

# Step 3: Commit archive to develop (optional)
git checkout develop
mkdir docs/railway-archive
mv railway-archive/* docs/railway-archive/
git add docs/railway-archive
git commit -m "Archive Railway deployment configs for reference"
git push origin develop
```

---

#### Phase 3: Delete `develop-railway` Branch

**When:** AWS is fully operational and you no longer need Railway

**Commands:**

```bash
# Step 1: Verify AWS deployment is working
# (Check AWS console, test application)

# Step 2: Stop Railway service
# Go to Railway dashboard → Delete services

# Step 3: Delete local branch
git branch -d develop-railway
# If Git complains, force delete:
git branch -D develop-railway

# Step 4: Delete remote branch
git push origin --delete develop-railway

# Step 5: Verify deletion
git branch -a
# develop-railway should be gone

# Step 6: Update Railway deployment (if keeping Railway but switching branch)
# Railway dashboard → Settings → Source → Change to main or develop
```

**Post-deletion:**
- Update documentation to remove Railway references
- Update CI/CD if you had Railway-specific workflows
- Celebrate! 🎉 You're now on AWS!

---

## Git Commands Reference

### Safety Checks

#### Before ANY merge, run these checks:

```bash
# 1. Check current branch
git branch
# Should show: * develop-railway (or whatever branch you're on)

# 2. Check if working directory is clean
git status
# Should show: "nothing to commit, working tree clean"

# 3. Check what you're about to merge
git log HEAD..origin/develop --oneline

# 4. See file changes
git diff HEAD..origin/develop --name-only

# 5. Check for uncommitted changes
git diff
# Should be empty
```

---

### Branch Operations

#### Creating Branches

```bash
# Create branch from current branch
git checkout -b new-branch-name

# Create branch from specific branch
git checkout -b new-branch-name source-branch-name

# Example: Create railway feature from develop-railway
git checkout develop-railway
git checkout -b railway-feature/cors-fix
```

---

#### Switching Branches

```bash
# Switch to existing branch
git checkout branch-name

# Create and switch in one command
git checkout -b new-branch-name

# Switch to previous branch
git checkout -

# Example workflow:
git checkout develop         # Go to develop
git checkout develop-railway # Go to develop-railway
git checkout -               # Back to develop
```

---

#### Viewing Branches

```bash
# List local branches
git branch

# List all branches (including remote)
git branch -a

# List with last commit message
git branch -v

# Show merged branches
git branch --merged

# Show unmerged branches
git branch --no-merged
```

---

### Syncing Operations

#### Merging (Combine Branches)

```bash
# Merge develop into develop-railway (standard sync)
git checkout develop-railway
git merge origin/develop

# Merge with message
git merge origin/develop -m "Sync latest features from develop"

# Abort merge if conflicts are too complex
git merge --abort
```

---

#### Cherry-picking (Select Specific Commits)

```bash
# View commits to pick from
git log develop --oneline -10

# Cherry-pick a single commit
git cherry-pick abc1234

# Cherry-pick multiple commits
git cherry-pick abc1234 def5678

# Cherry-pick with edit (modify commit message)
git cherry-pick abc1234 -e

# Abort cherry-pick
git cherry-pick --abort
```

---

#### Rebasing (NOT recommended for develop-railway)

**⚠️ Warning:** Don't rebase shared branches like `develop-railway`

```bash
# If you must rebase (use merge instead)
git checkout develop-railway
git rebase develop

# Abort if conflicts
git rebase --abort
```

**Why avoid rebase?**
- Rewrites history
- Causes problems for other developers
- Merging is safer for shared branches

---

### Checking Differences

```bash
# Compare two branches
git diff develop..develop-railway

# Compare specific file between branches
git diff develop..develop-railway -- application.properties

# Show commits in develop not in develop-railway
git log develop-railway..develop --oneline

# Show commits in develop-railway not in develop
git log develop..develop-railway --oneline

# Files changed between branches
git diff --name-only develop..develop-railway

# Summary of changes
git diff --stat develop..develop-railway
```

---

### Undoing Mistakes

#### Undo Last Commit (Keep Changes)

```bash
# Undo commit, keep files staged
git reset --soft HEAD~1

# Undo commit, unstage files
git reset HEAD~1

# Undo commit, discard all changes (DANGEROUS!)
git reset --hard HEAD~1
```

---

#### Revert a Commit (Safe)

```bash
# Create new commit that undoes a previous commit
git revert abc1234

# Revert last commit
git revert HEAD

# Revert without committing (review changes first)
git revert abc1234 --no-commit
```

---

#### Discard Local Changes

```bash
# Discard changes in specific file
git checkout -- filename

# Discard all local changes
git reset --hard HEAD

# Discard changes but keep untracked files
git reset --hard
```

---

#### Undo Push (Emergency!)

```bash
# ⚠️ ONLY for develop-railway, NEVER for develop/main

# Step 1: Reset to previous commit
git reset --hard abc1234

# Step 2: Force push (overwrites remote)
git push --force origin develop-railway
```

**Warning:** Force push is dangerous! Only use on `develop-railway`, never on `develop` or `main`.

---

### Moving Commits Between Branches

#### Move commit from wrong branch

**Scenario:** You committed to `develop` but should have committed to `develop-railway`

```bash
# Step 1: Note the commit hash
git log --oneline -1
# abc1234 My commit message

# Step 2: Switch to correct branch
git checkout develop-railway

# Step 3: Cherry-pick the commit
git cherry-pick abc1234

# Step 4: Go back to wrong branch
git checkout develop

# Step 5: Remove the commit
git reset --hard HEAD~1

# Step 6: Push both branches (if already pushed to remote)
git checkout develop
git push --force origin develop  # ⚠️ Only if necessary

git checkout develop-railway
git push origin develop-railway
```

---

### Checking Branch Relationships

```bash
# Show branch graph
git log --oneline --graph --all --decorate

# Show merge history
git log --merges

# Show commits unique to each branch
git log --left-right --oneline develop...develop-railway

# Check if branch A contains branch B
git branch --contains abc1234

# Find common ancestor
git merge-base develop develop-railway
```

---

## Configuration Management Strategy

### Problem Statement

You need different configurations for:
- **Local development:** `localhost:5432/finaldb`
- **Railway deployment:** Railway PostgreSQL URL
- **AWS deployment (future):** AWS RDS URL

**Challenge:** How to manage these without creating branch conflicts?

---

### Solution 1: Environment Variables Only (⭐ RECOMMENDED)

**Principle:** Same code everywhere, different environment variables

#### Backend (Spring Boot)

**File: `application.properties` (same in all branches)**

```properties
# Server
server.port=${PORT:8080}

# Database (use environment variables)
spring.datasource.url=${DATABASE_URL:jdbc:postgresql://localhost:5432/finaldb}
spring.datasource.username=${DB_USERNAME:postgres}
spring.datasource.password=${DB_PASSWORD:123456}

# CORS
cors.allowed.origins=${CORS_ALLOWED_ORIGINS:http://localhost:4200}

# Redis (if using)
spring.data.redis.host=${REDIS_HOST:localhost}
spring.data.redis.port=${REDIS_PORT:6379}
spring.data.redis.password=${REDIS_PASSWORD:}

# AWS S3 (if using)
aws.access.key.id=${AWS_ACCESS_KEY_ID}
aws.secret.access.key=${AWS_SECRET_ACCESS_KEY}
aws.s3.bucket.name=${S3_BUCKET_NAME}
```

**Explanation:**
- `${VARIABLE:default}` means: Use `VARIABLE` if set, otherwise use `default`
- Local: No variables set → uses defaults
- Railway: Variables set in Railway dashboard
- AWS: Variables set in AWS console

**Result:** No conflicts! Same file in all branches.

---

#### Frontend (Angular)

**File: `environment.prod.ts` (same in all branches)**

```typescript
export const environment = {
  production: true,
  apiUrl: 'API_URL_PLACEHOLDER'  // Replaced by Dockerfile
};
```

**File: `Dockerfile` (Railway version)**

```dockerfile
# ... build steps ...

# Replace API_URL_PLACEHOLDER with environment variable
CMD ["/bin/sh", "-c", "find /usr/share/nginx/html -type f \\( -name '*.js' -o -name '*.mjs' \\) -exec sed -i \"s|API_URL_PLACEHOLDER|${API_URL}|g\" {} \\; && nginx -g 'daemon off;'"]
```

**Set in Railway dashboard:**
```
API_URL=https://your-backend.up.railway.app
```

**Result:** Same code, different runtime values!

---

### Solution 2: Profile-Based Configuration (Alternative)

#### Backend: Multiple Properties Files

```
backend/src/main/resources/
├── application.properties        # Base config
├── application-dev.properties    # Local dev
├── application-railway.properties # Railway
└── application-aws.properties    # AWS (future)
```

**Base: `application.properties`**
```properties
server.port=8080
spring.jpa.hibernate.ddl-auto=update
```

**Local: `application-dev.properties`**
```properties
spring.datasource.url=jdbc:postgresql://localhost:5432/finaldb
spring.datasource.username=postgres
spring.datasource.password=123456
cors.allowed.origins=http://localhost:4200
```

**Railway: `application-railway.properties`**
```properties
spring.datasource.url=${SPRING_DATASOURCE_URL}
spring.datasource.username=${SPRING_DATASOURCE_USERNAME}
spring.datasource.password=${SPRING_DATASOURCE_PASSWORD}
cors.allowed.origins=${CORS_ALLOWED_ORIGINS}
```

**Activate profile in Railway:**
Set environment variable:
```
SPRING_PROFILES_ACTIVE=railway
```

**Activate profile locally:**
```bash
mvn spring-boot:run -Dspring-boot.run.profiles=dev
```

**Pros:**
- ✅ Clear separation of configs
- ✅ All configs tracked in Git
- ✅ No branch-specific code

**Cons:**
- ❌ More files to manage
- ❌ Must remember to set profile

---

### Solution 3: Separate Config Files (Not Recommended)

**Bad approach:**
```
# In develop-railway only:
application-railway.properties

# In develop only:
application-local.properties
```

**Why bad:**
- ❌ Creates branch differences
- ❌ Causes merge conflicts
- ❌ Hard to sync changes

---

### Recommended Approach Summary

| Aspect | Recommended Strategy |
|--------|---------------------|
| **Database URLs** | Environment variables |
| **API endpoints** | Environment variables |
| **CORS origins** | Environment variables |
| **Secret keys** | Environment variables (never in Git!) |
| **Port numbers** | Environment variables with defaults |
| **Build configs** | Same in all branches (use env vars at runtime) |

**Golden Rule:** If it's environment-specific, use environment variables, not code!

---

### Railway Environment Variables Setup

**What to set in Railway dashboard:**

**Backend service:**
```
PORT=8080
SPRING_DATASOURCE_URL=${{Postgres.DATABASE_URL}}
SPRING_DATASOURCE_USERNAME=${{Postgres.PGUSER}}
SPRING_DATASOURCE_PASSWORD=${{Postgres.PGPASSWORD}}
CORS_ALLOWED_ORIGINS=http://localhost:4200,https://your-frontend.railway.app
```

**Frontend service:**
```
PORT=8080
API_URL=https://your-backend.railway.app
```

---

### Handling Secrets

**❌ NEVER commit to Git:**
- Database passwords
- AWS access keys
- API secret keys
- JWT secrets

**✅ ALWAYS use:**
- Environment variables in Railway dashboard
- `.env` files locally (added to `.gitignore`)
- AWS Secrets Manager (for AWS deployment)

**Example `.gitignore`:**
```
.env
.env.local
.env.railway
application-secrets.properties
secrets/
```

---

## Safety Guardrails

### 1. Branch Protection Rules (GitHub)

#### Protect `main` branch

**Settings → Branches → Add rule for `main`:**

- ✅ **Require pull request reviews before merging**
  - Required approvals: 1
- ✅ **Require status checks to pass before merging**
  - Select: CI/CD checks (if you have them)
- ✅ **Require conversation resolution before merging**
- ✅ **Do not allow bypassing the above settings**
- ✅ **Restrict who can push to matching branches**
  - Add only: Repository admins

**Result:** Nobody (including you) can accidentally push to `main`

---

#### Protect `develop` branch

**Settings → Branches → Add rule for `develop`:**

- ✅ **Require pull request reviews before merging** (optional)
- ✅ **Restrict who can push to matching branches**
  - Add trusted developers only
- ⚠️ **Include administrators** (optional - makes you follow rules too)

**Result:** All changes to `develop` go through PRs

---

#### Don't protect `develop-railway`

**Why?**
- You need to push directly for quick Railway updates
- It's temporary and lower risk

**But do:**
- Make it clear in documentation that this branch is Railway-only
- Delete it ASAP when AWS is ready

---

### 2. Pre-Merge Checklist

**Before merging `develop` → `develop-railway`:**

Print this checklist and check it **every time**:

```
☐ I am on the correct branch (develop-railway)
☐ I have pulled latest from develop-railway
☐ I have reviewed commits I'm about to merge
☐ I have checked for config file conflicts
☐ I have a backup plan if deployment breaks
☐ Railway is not currently being demoed
☐ I have 30 minutes to fix issues if they arise
```

**Before merging feature → develop:**

```
☐ Feature branch is from develop (not develop-railway!)
☐ Code has been tested locally
☐ No Railway-specific code in this branch
☐ PR has been reviewed (if team project)
☐ CI/CD checks passed (if configured)
```

**Before merging develop → main (AWS deployment):**

```
☐ All features in develop are AWS-ready
☐ No Railway-specific code in develop
☐ AWS infrastructure is ready
☐ Database migration scripts prepared
☐ Rollback plan documented
☐ Team is aware of deployment
```

---

### 3. Naming Conventions

**Branch naming rules:**

| Branch Type | Pattern | Example | Merge Target |
|-------------|---------|---------|--------------|
| Regular feature | `feature/*` | `feature/user-auth` | `develop` |
| Regular bugfix | `bugfix/*` | `bugfix/login-error` | `develop` |
| Railway feature | `railway-feature/*` | `railway-feature/cors-fix` | `develop-railway` |
| Railway bugfix | `railway-bugfix/*` | `railway-bugfix/port-8080` | `develop-railway` |
| Railway config | `railway-config/*` | `railway-config/env-vars` | `develop-railway` |
| Hotfix (urgent) | `hotfix/*` | `hotfix/security-patch` | `main` + `develop` |

**Why prefix Railway branches?**
- **Visual reminder:** "This is Railway-only"
- **Prevents accidents:** Less likely to merge to wrong branch
- **Easy filtering:** `git branch | grep railway-`

---

### 4. Preventing Accidental Merges

#### Use Git Hooks (Local Safety)

Create file: `.git/hooks/pre-push` (in your local repo)

```bash
#!/bin/bash

# Prevent pushing develop-railway to develop or main
current_branch=$(git rev-parse --abbrev-ref HEAD)
remote=$1
url=$2

if [ "$current_branch" = "develop-railway" ]; then
  echo "⚠️  WARNING: You are on develop-railway branch"
  echo "This branch should ONLY be pushed to origin/develop-railway"
  echo ""
  read -p "Are you pushing to develop-railway? (yes/no): " confirm

  if [ "$confirm" != "yes" ]; then
    echo "❌ Push cancelled"
    exit 1
  fi
fi

exit 0
```

**Make it executable:**
```bash
chmod +x .git/hooks/pre-push
```

**What this does:**
- Asks for confirmation before pushing `develop-railway`
- Prevents accidental pushes to wrong branch

---

#### GitHub Actions (Optional)

Create file: `.github/workflows/branch-protection.yml`

```yaml
name: Branch Protection

on:
  pull_request:
    branches:
      - develop
      - main

jobs:
  check-branch:
    runs-on: ubuntu-latest
    steps:
      - name: Check for Railway code in develop/main
        uses: actions/checkout@v3

      - name: Scan for Railway-specific configs
        run: |
          if git diff --name-only origin/develop...HEAD | grep -E "(railway|Railway)"; then
            echo "❌ ERROR: Railway-specific code detected in PR to develop/main"
            echo "Railway code should only be in develop-railway branch"
            exit 1
          fi

      - name: Check branch name
        run: |
          if [[ "${{ github.head_ref }}" == railway-* ]]; then
            echo "❌ ERROR: Railway branches should not be merged to develop/main"
            exit 1
          fi
```

**What this does:**
- Automatically checks PRs to `develop` and `main`
- Rejects PRs from Railway branches
- Prevents Railway configs from reaching production branches

---

### 5. Code Review Requirements

**For team projects:**

**Pull requests to `develop`:**
- ✅ Required: 1 approval
- ✅ Reviewer checks: No Railway-specific code
- ✅ Reviewer verifies: Tests pass

**Pull requests to `main`:**
- ✅ Required: 2 approvals (if team)
- ✅ Deployment checklist completed
- ✅ AWS infrastructure ready

**Pull requests to `develop-railway`:**
- ⚠️ Optional: Can be merged without review (it's temporary)
- ✅ But good practice: Self-review before merge

---

### 6. Emergency Contacts Checklist

**Keep this information handy:**

```
Railway Dashboard: https://railway.app/project/YOUR_PROJECT_ID
GitHub Repo: https://github.com/yourname/inventory
Last Known Good Commit (develop-railway): abc1234

Emergency Rollback:
  git reset --hard abc1234
  git push --force origin develop-railway

Backup Branch (if needed):
  git branch develop-railway-backup develop-railway
```

---

## Troubleshooting Guide

### Scenario 1: "I accidentally merged `develop-railway` to `develop`"

**Severity:** 🔴 HIGH (Don't push yet!)

**Symptoms:**
- You ran: `git merge develop-railway` while on `develop` branch
- Merge succeeded
- You haven't pushed yet

**Solution:**

```bash
# Step 1: STOP! Don't push to develop!

# Step 2: Check if you've pushed
git status
# If it says "Your branch is ahead of origin/develop", you haven't pushed yet ✅

# Step 3: Undo the merge (keep changes)
git reset --soft HEAD~1

# OR: Undo the merge (discard changes)
git reset --hard HEAD~1

# Step 4: Verify develop is clean
git status
# Should show: "Your branch is up to date with origin/develop"

# Step 5: Switch to correct branch
git checkout develop-railway

# Step 6: If you already pushed to develop (disaster scenario)
# Contact team immediately, then:
git checkout develop
git reset --hard origin/develop  # Lose local changes
# OR
git revert HEAD  # Keep history but undo merge

# Step 7: Force push (⚠️ DANGER - coordinate with team!)
git push --force origin develop
```

**Prevention:**
- Always check: `git branch` before merging
- Use branch protection rules
- Set up Git hooks (see Safety Guardrails)

---

### Scenario 2: "Merge conflict between `develop` and `develop-railway`"

**Severity:** 🟡 MEDIUM (Expected occasionally)

**Symptoms:**
```
CONFLICT (content): Merge conflict in application.properties
Automatic merge failed; fix conflicts and then commit the result.
```

**Solution:**

```bash
# Step 1: Don't panic! This is normal.

# Step 2: See which files have conflicts
git status

# Example output:
# Unmerged paths:
#   both modified:   backend/src/main/resources/application.properties

# Step 3: Open the file in your editor
# Look for conflict markers:

<<<<<<< HEAD (develop-railway)
spring.datasource.url=${SPRING_DATASOURCE_URL}
=======
spring.datasource.url=jdbc:postgresql://localhost:5432/finaldb
>>>>>>> origin/develop

# Step 4: Decide what to keep
# Usually, keep Railway version (HEAD) for environment-specific settings

# Resolution:
spring.datasource.url=${SPRING_DATASOURCE_URL}  # Keep Railway version

# Step 5: Remove conflict markers (<<<, ===, >>>)

# Step 6: Mark as resolved
git add application.properties

# Step 7: Complete merge
git commit
# Git will generate a merge commit message

# Step 8: Test before pushing!
npm start  # Frontend
mvn spring-boot:run  # Backend

# Step 9: If tests pass, push
git push origin develop-railway
```

**Common conflicts and resolutions:**

| File | Conflict | Keep |
|------|----------|------|
| `application.properties` | Database URL | Railway version (env var) |
| `environment.prod.ts` | API URL | Railway version (placeholder) |
| `Dockerfile` | Port settings | Railway version (8080) |
| `.gitignore` | Entries | Merge both (combine) |
| Business logic | Code changes | Develop version (new features) |

---

### Scenario 3: "Railway deployment broke after sync"

**Severity:** 🔴 HIGH (Production demo broken!)

**Symptoms:**
- Pushed to `develop-railway`
- Railway deployed
- Application returns 500 errors or won't start

**Immediate fix (Rollback):**

```bash
# Step 1: Find last working deployment
git log develop-railway --oneline -5

# Example output:
# abc1234 (HEAD) Merge develop to develop-railway  ← BROKEN
# def5678 Fix Railway CORS                         ← LAST KNOWN GOOD
# xyz9012 Add product search feature

# Step 2: Revert to last known good commit
git reset --hard def5678

# Step 3: Force push (Railway will redeploy old version)
git push --force origin develop-railway

# Railway will auto-deploy within 1-2 minutes
```

**Root cause analysis:**

```bash
# Step 1: Create a test branch to investigate
git checkout -b test-broken-merge develop-railway

# Step 2: Reapply the broken merge
git reset --hard abc1234

# Step 3: Check Railway logs
# Go to Railway dashboard → Backend service → Logs

# Step 4: Test locally with Railway-like environment
export SPRING_DATASOURCE_URL="postgresql://localhost:5432/finaldb"
export PORT=8080
mvn spring-boot:run

# Step 5: Identify the problem
# Common issues:
# - Missing environment variable
# - Config file syntax error
# - Dependency conflict
# - Port binding issue

# Step 6: Fix the issue on test branch
# Edit files...

# Step 7: Test fix locally
mvn spring-boot:run

# Step 8: If fix works, apply to develop-railway
git checkout develop-railway
git cherry-pick <fix-commit-hash>
git push origin develop-railway
```

---

### Scenario 4: "I committed to the wrong branch"

**Severity:** 🟡 MEDIUM

**Symptoms:**
- You made commits on `develop-railway` that should be on `develop`
- Or vice versa

**Solution (Move commit to correct branch):**

```bash
# Step 1: Note the commit hash
git log --oneline -1
# abc1234 Add new feature

# Step 2: Switch to correct branch
git checkout develop  # (or develop-railway)

# Step 3: Cherry-pick the commit
git cherry-pick abc1234

# Step 4: Go back to wrong branch
git checkout develop-railway  # (or develop)

# Step 5: Remove the commit from wrong branch
git reset --hard HEAD~1

# Step 6: Push both branches
git checkout develop
git push origin develop

git checkout develop-railway
# If you already pushed, you'll need force push:
git push --force origin develop-railway
```

**Alternative (If commit is in middle of history):**

```bash
# Use interactive rebase to remove specific commit
git rebase -i HEAD~5

# In editor, delete the line with the wrong commit
# Save and exit
```

---

### Scenario 5: "How do I check which changes are Railway-specific?"

**Severity:** 🟢 LOW (Informational)

**Solution:**

```bash
# Step 1: Compare branches
git diff develop..develop-railway

# Step 2: Show only file names
git diff --name-only develop..develop-railway

# Step 3: Show summary
git diff --stat develop..develop-railway

# Step 4: Check specific file
git diff develop..develop-railway -- application.properties

# Step 5: View commit messages unique to develop-railway
git log develop..develop-railway --oneline

# Step 6: Create a report
git log develop..develop-railway --pretty=format:"%h %s" > railway-specific-changes.txt
```

**Example output interpretation:**

```
backend/src/main/resources/application.properties  # Config - Railway-specific ✅
frontend/src/app/services/api.service.ts           # Business logic - Should be in develop! ⚠️
```

**Action:**
- Config files = Expected Railway differences
- Business logic = Should be synced to develop

---

### Scenario 6: "I deleted a branch by accident"

**Severity:** 🟡 MEDIUM

**Symptoms:**
- Ran `git branch -D railway-feature/important-thing`
- Branch is gone locally

**Solution:**

```bash
# Step 1: Check if branch exists on remote
git branch -a | grep railway-feature/important-thing

# If it shows: remotes/origin/railway-feature/important-thing
# Step 2: Recover from remote
git checkout -b railway-feature/important-thing origin/railway-feature/important-thing

# If branch was only local (never pushed):
# Step 3: Use reflog to find commit
git reflog

# Look for the branch in output:
# abc1234 HEAD@{5}: checkout: moving from railway-feature/important-thing to develop-railway

# Step 4: Recreate branch
git checkout -b railway-feature/important-thing abc1234
```

**Prevention:**
- Always push feature branches: `git push -u origin branch-name`
- Don't use `-D` flag unless you're sure

---

### Scenario 7: "Railway and develop have diverged too much"

**Severity:** 🔴 HIGH (Long-term problem)

**Symptoms:**
- `develop-railway` hasn't been synced in weeks
- Attempting merge causes 50+ conflicts
- Hard to tell what's Railway-specific vs missing features

**Solution (Nuclear option - recreate branch):**

```bash
# ⚠️ WARNING: This loses Railway-specific changes!

# Step 1: Document Railway-specific changes
git log develop..develop-railway --oneline > railway-changes-archive.txt
git diff develop..develop-railway > railway-diff-archive.txt

# Step 2: Save important Railway configs
git show develop-railway:application.properties > railway-application.properties.backup

# Step 3: Delete develop-railway
git branch -D develop-railway
git push origin --delete develop-railway

# Step 4: Recreate from current develop
git checkout develop
git pull origin develop
git checkout -b develop-railway

# Step 5: Reapply Railway-specific configs manually
# Edit files to add Railway settings...

# Step 6: Push new develop-railway
git push -u origin develop-railway

# Step 7: Update Railway deployment
# Railway dashboard → Settings → Redeploy
```

**Prevention:**
- Sync at least weekly
- Keep Railway configs in separate files (less conflict)
- Use environment variables instead of code differences

---

### Scenario 8: "Can't push - 'rejected' error"

**Severity:** 🟡 MEDIUM

**Symptoms:**
```bash
git push origin develop-railway
# Error: Updates were rejected because the remote contains work that you do not have locally
```

**Solution:**

```bash
# Step 1: See what changed on remote
git fetch origin
git log HEAD..origin/develop-railway --oneline

# Step 2: Decide strategy

# Option A: Merge remote changes (safest)
git pull origin develop-railway
# Resolve conflicts if any
git push origin develop-railway

# Option B: Rebase (cleaner history, but risky)
git pull --rebase origin develop-railway
# Resolve conflicts if any
git push origin develop-railway

# Option C: Force push (⚠️ DANGER - only if you're sure)
# Use only if you know remote changes are bad
git push --force origin develop-railway
```

---

## Quick Reference Cheatsheet

### Branch Flow Diagram (One-Page)

```
┌─────────────────────────────────────────────────────────────┐
│                   GIT BRANCH STRATEGY                        │
│                                                              │
│  main (AWS) ◄─────── develop ◄─────── feature/*            │
│                         │                                    │
│                         │ (one-way sync)                    │
│                         ▼                                    │
│              develop-railway ◄─────── railway-feature/*     │
│                         │                                    │
│                         ▼                                    │
│                   Railway Deploy                             │
│                                                              │
│  ALLOWED:  develop → develop-railway ✅                     │
│  FORBIDDEN: develop-railway → develop ❌                    │
│  FORBIDDEN: develop-railway → main ❌                       │
└─────────────────────────────────────────────────────────────┘
```

---

### Top 5 Most Common Commands

```bash
# 1. Sync develop to develop-railway (weekly)
git checkout develop-railway
git merge origin/develop
git push origin develop-railway

# 2. Create Railway feature branch
git checkout develop-railway
git checkout -b railway-feature/description

# 3. Create regular feature branch
git checkout develop
git checkout -b feature/description

# 4. Emergency rollback
git reset --hard abc1234
git push --force origin develop-railway

# 5. Check what's different
git diff develop..develop-railway --name-only
```

---

### Do's and Don'ts

#### ✅ DO

- ✅ Sync `develop` to `develop-railway` weekly
- ✅ Test after every sync before pushing
- ✅ Use environment variables for configs
- ✅ Delete `develop-railway` when AWS is ready
- ✅ Create Railway branches with `railway-` prefix
- ✅ Check current branch before committing: `git branch`
- ✅ Keep Railway configs in separate files or env vars
- ✅ Document Railway-specific changes before deleting branch

#### ❌ DON'T

- ❌ Never merge `develop-railway` back to `develop`
- ❌ Never merge `develop-railway` to `main`
- ❌ Never merge `railway-feature/*` to `develop`
- ❌ Never commit secrets to Git
- ❌ Never force push to `develop` or `main`
- ❌ Never let `develop-railway` drift for >2 weeks
- ❌ Never use `develop-railway` as permanent solution
- ❌ Never skip testing after sync

---

### Emergency Rollback Command

```bash
# Copy this and keep it handy!
# Replace abc1234 with last known good commit

git checkout develop-railway && \
git reset --hard abc1234 && \
git push --force origin develop-railway
```

**When to use:**
- Railway deployment is broken
- Demo is in 10 minutes
- You need to get back to working state IMMEDIATELY

---

### Pre-Merge Checklist (Print This!)

```
BEFORE MERGING develop → develop-railway:

☐ Current branch is develop-railway
☐ Working directory is clean (git status)
☐ Reviewed commits to merge (git log)
☐ No active Railway demo happening now
☐ Have 30 minutes for testing/fixes
☐ Noted last good commit (backup plan)

AFTER MERGING:

☐ Resolved all conflicts
☐ Tested locally (backend + frontend)
☐ Pushed to develop-railway
☐ Monitored Railway deployment logs
☐ Tested live Railway URL
☐ Verified critical features work
```

---

### Branch Quick Reference

| Branch | Purpose | Merge To | Merge From | Deploy To |
|--------|---------|----------|------------|-----------|
| `main` | AWS Production | - | `develop` (when ready) | AWS |
| `develop` | Active development | `main` | `feature/*`, `bugfix/*` | - |
| `develop-railway` | Railway demo | ❌ NEVER | `develop`, `railway-*` | Railway |
| `feature/*` | New features | `develop` | - | - |
| `railway-feature/*` | Railway configs | `develop-railway` | - | - |

---

### Git Status Interpretation

```bash
$ git status

# ✅ GOOD (safe to proceed):
On branch develop-railway
Your branch is up to date with 'origin/develop-railway'.
nothing to commit, working tree clean

# ⚠️ WARNING (uncommitted changes):
On branch develop-railway
Changes not staged for commit:
  modified:   application.properties

# 🔴 DANGER (wrong branch!):
On branch develop
Changes to be committed:
  modified:   railway-config.txt
# ^ Railway file on develop = BAD!

# 🟡 ATTENTION (ahead of remote):
On branch develop-railway
Your branch is ahead of 'origin/develop-railway' by 3 commits.
# You have unpushed commits
```

---

### Contact Information (Fill This In!)

```
Project: Inventory Management System
GitHub Repo: _________________________________
Railway Project ID: ___________________________

Team Members:
- Developer: _____________________ (GitHub: _________)
- Reviewer: ______________________ (GitHub: _________)

Last Sync Date: ___________
Last Known Good Commit (develop-railway): ___________
AWS Go-Live Target: ___________

Emergency Contacts:
- If Git broken: ___________________
- If Railway broken: _______________
- If everything broken: _____________ (😅)
```

---

## Summary

### Key Takeaways

1. **`develop-railway` is temporary** - Delete it when AWS is ready
2. **One-way flow only** - Changes go FROM `develop` TO `develop-railway`, never back
3. **Sync weekly** - Don't let branches drift apart
4. **Use environment variables** - Avoid code differences between branches
5. **Test after sync** - Always test before Railway deploys
6. **Branch protection** - Set up rules on GitHub to prevent accidents
7. **Document Railway changes** - Archive them before deleting branch

---

### Success Metrics

You're doing it right if:

- ✅ `develop` and `main` have no Railway-specific code
- ✅ Syncing from `develop` to `develop-railway` takes <30 minutes
- ✅ You haven't accidentally merged back to `develop`
- ✅ Railway deployments succeed >90% of the time
- ✅ You can explain the flow to a teammate in 2 minutes

---

### When to Abandon This Strategy

**Consider switching to environment variables only if:**

- Syncing conflicts happen more than weekly
- You're spending >2 hours/week managing branches
- Railway-specific code keeps leaking to `develop`
- Team is confused by the workflow

**Signs it's time to migrate to AWS:**

- Railway monthly cost exceeds AWS estimate
- You've mastered AWS setup
- Stakeholder demos are complete
- You've kept `develop-railway` for >3 months

---

### Next Steps

1. **Week 1:** Set up branch protection rules
2. **Week 2:** Create `develop-railway` and deploy to Railway
3. **Week 3-N:** Regular development with weekly syncs
4. **Week N+1:** Plan AWS migration
5. **Week N+2:** Delete `develop-railway` and celebrate! 🎉

---

## Additional Resources

### Git Learning

- [Git Branching Basics](https://git-scm.com/book/en/v2/Git-Branching-Basic-Branching-and-Merging)
- [Atlassian Git Tutorials](https://www.atlassian.com/git/tutorials)
- [Git Flight Rules](https://github.com/k88hudson/git-flight-rules) (Emergency fixes)

### Railway Documentation

- [Railway Deployment Guide](https://docs.railway.app/deploy/deployments)
- [Railway Environment Variables](https://docs.railway.app/develop/variables)

### Related Project Documents

- [COMPLETE_WORKFLOW_GUIDE.md](COMPLETE_WORKFLOW_GUIDE.md) - General Git workflow
- [RAILWAY_DEPLOY.md](RAILWAY_DEPLOY.md) - Railway deployment setup
- [ENVIRONMENT_CONFIG_GUIDE.md](ENVIRONMENT_CONFIG_GUIDE.md) - Managing configs

---

**Good luck with your Railway deployment!** 🚀

Remember: This is a temporary strategy. Keep it simple, sync regularly, and plan for AWS migration from day one.
