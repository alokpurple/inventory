# Professional Git Workflow Guide

## Branch Strategy

### Main Branches
- **`main`** (or `master`) - Production-ready code (deployed to Railway)
- **`develop`** - Integration branch for features (your working branch)

### Supporting Branches
- **`feature/*`** - For new features (e.g., `feature/user-authentication`)
- **`bugfix/*`** - For bug fixes (e.g., `bugfix/cors-issue`)
- **`hotfix/*`** - For urgent production fixes

---

## Setup: Create Development Branch

Currently, you're working directly on `main`. Let's create a proper workflow:

```bash
# Create and switch to develop branch
git checkout -b develop

# Push develop branch to GitHub
git push -u origin develop
```

---

## Daily Workflow

### 1. Starting a New Feature

```bash
# Make sure you're on develop
git checkout develop

# Pull latest changes
git pull origin develop

# Create feature branch
git checkout -b feature/feature-name

# Example:
git checkout -b feature/add-inventory-search
```

### 2. Working on the Feature

```bash
# Make your changes
# Test locally using dev profile

# Stage changes
git add .

# Commit with meaningful message
git commit -m "Add inventory search functionality"

# Push to GitHub
git push -u origin feature/add-inventory-search
```

### 3. Completing the Feature

```bash
# Switch to develop
git checkout develop

# Merge feature branch
git merge feature/add-inventory-search

# Push to GitHub
git push origin develop

# Delete feature branch (optional)
git branch -d feature/add-inventory-search
git push origin --delete feature/add-inventory-search
```

### 4. Deploying to Production (Railway)

```bash
# Test everything on develop first!

# Switch to main
git checkout main

# Merge develop into main
git merge develop

# Push to main (triggers Railway deployment)
git push origin main

# Switch back to develop for continued work
git checkout develop
```

---

## Railway Configuration

### Configure Railway to Deploy from Main Only

1. Go to Railway → Your Project
2. Click on each service (backend/frontend)
3. Go to **Settings** → **Service**
4. Set **Branch** to `main`
5. Now Railway only deploys when you push to `main`

This way:
- You work on `develop` branch locally
- Test thoroughly
- Only merge to `main` when ready to go live

---

## Your Current Situation

Right now:
- Every push to `main` triggers Railway deployment
- You're working directly on `main`
- This causes conflicts between local and production

**Solution:**

```bash
# 1. Create develop branch from current state
git checkout -b develop
git push -u origin develop

# 2. Continue working on develop
# Your local changes stay on develop

# 3. Only merge to main when ready to deploy
git checkout main
git merge develop
git push origin main  # This deploys to Railway
```

---

## Best Practices

### Commit Messages

Good:
```
Add user authentication feature
Fix CORS error on login endpoint
Update database schema for inventory table
```

Bad:
```
fix
update
changes
asdfgh
```

### Before Merging to Main

- [ ] All features tested locally
- [ ] No errors in console
- [ ] Database migrations tested
- [ ] Frontend builds successfully
- [ ] Backend starts without errors

### When to Merge to Main

- ✅ Feature is complete and tested
- ✅ No breaking changes
- ✅ Code is reviewed (self-review at minimum)
- ❌ Don't merge incomplete work
- ❌ Don't merge untested code

---

## Quick Reference

| Task | Command |
|------|---------|
| Start new feature | `git checkout -b feature/name` |
| Commit changes | `git add . && git commit -m "message"` |
| Push feature | `git push -u origin feature/name` |
| Switch to develop | `git checkout develop` |
| Merge feature to develop | `git merge feature/name` |
| Deploy to production | `git checkout main && git merge develop && git push` |
| See current branch | `git branch` |
| See all branches | `git branch -a` |
| Pull latest changes | `git pull origin develop` |

---

## Configuration Files by Environment

### Local Development
- `backend/src/main/resources/application-dev.properties`
- `frontend/src/environments/environment.ts`
- Run with: `SPRING_PROFILES_ACTIVE=dev`

### Production (Railway)
- `backend/src/main/resources/application.properties`
- `frontend/src/environments/environment.prod.ts`
- Deployed from: `main` branch

---

## Handling Conflicts

If you have uncommitted changes when switching branches:

```bash
# Save your work temporarily
git stash

# Switch branch
git checkout develop

# Apply your saved work
git stash pop
```

---

## Emergency: Rollback Production

If you deployed something broken:

```bash
# See commit history
git log

# Rollback to previous commit
git checkout main
git reset --hard COMMIT_HASH_OF_GOOD_VERSION
git push -f origin main  # Force push (use carefully!)
```

**Note:** Force push should only be used in emergencies!

---

## Your Next Steps

1. **Create develop branch**
   ```bash
   git checkout -b develop
   git push -u origin develop
   ```

2. **Configure Railway to deploy only from main**

3. **Work on develop branch daily**

4. **Merge to main only when ready to deploy**

This separates your development work from production!
