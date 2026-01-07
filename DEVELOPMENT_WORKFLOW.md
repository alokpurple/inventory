# 🔄 Professional Development Workflow Guide

Since we have set up the project on the `main` branch, it is crucial to adopt a safe workflow for adding future features. Modifying the `main` branch directly is risky because `main` usually triggers a deployment to Production.

This guide outlines the **Feature Branch Workflow**, the industry standard for managing code safely.

---

## 🛑 The Golden Rule
**NEVER push directly to the `main` branch.**
Treat `main` as your "Production" code. It should always be stable and deployable.

---

## 🌿 The Workflow at a Glance

```mermaid
graph LR
    A[Main Branch (Production)] -->|Branch Off| B[Feature Branch]
    B -->|Code & Test| B
    B -->|Push| C[GitHub Pull Request]
    C -->|Review & Merge| A
    A -->|Auto-Deploy| D[Railway Production]
```

1.  **Sync** your local `main` with the remote repo.
2.  **Create** a new branch for your specific feature (e.g., `feature/add-dark-mode`).
3.  **Code** and test locally on that branch.
4.  **Push** the branch to GitHub.
5.  **Merge** via a Pull Request (PR) into `main`.
6.  **Deploy** (Railway automatically picks up changes to `main`).

---

## 👣 Step-by-Step Guide

### Phase 1: Starting a New Feature

Before writing code, ensure you are starting from the latest version of the project.

1.  **Switch to Main and Sync:**
    ```bash
    git checkout main
    git pull origin main
    ```
2.  **Create a Feature Branch:**
    Name your branch based on what you are doing (`feature/...`, `bugfix/...`, `hotfix/...`).
    ```bash
    git checkout -b feature/add-employee-search
    ```
    *You are now in a safe sandbox. Changes here won't affect the production code.*

### Phase 2: Development & Local Testing

Work on your code. Since you configured `application.properties` (backend) and `environment.ts` (frontend) to use local defaults, you can run the app locally without breaking production.

1.  **Run Backend (Terminal 1):**
    ```bash
    cd backend
    .\mvnw spring-boot:run
    ```
    *Connects to your local PostgreSQL (`finaldb`).*

2.  **Run Frontend (Terminal 2):**
    ```bash
    cd frontend
    ng serve
    ```
    *Connects to `http://localhost:8080`.*

3.  **Commit Often:**
    ```bash
    git add .
    git commit -m "Added search filter to employee service"
    ```

### Phase 3: Pushing & Merging

Once your feature works perfectly locally:

1.  **Push the Branch:**
    ```bash
    git push -u origin feature/add-employee-search
    ```

2.  **Create a Pull Request (PR):**
    *   Go to your repository on GitHub.
    *   You will see a "Compare & pull request" button. Click it.
    *   Review your changes.
    *   Click **Create Pull Request**.

3.  **Merge:**
    *   If you are working alone, you can merge it yourself.
    *   Click **"Merge pull request"** -> **"Confirm merge"**.

### Phase 4: Deployment

1.  **Railway Automation:**
    *   Railway watches your `main` branch.
    *   As soon as you merge the PR into `main`, Railway detects the new commit.
    *   It pulls the code, builds the Docker images, and updates the live site.

2.  **Cleanup:**
    *   Delete the feature branch locally:
        ```bash
        git checkout main
        git pull origin main
        git branch -d feature/add-employee-search
        ```

---

## 🚑 Handling Hotfixes (Emergency Bugs)

If Production is broken, do not wait for a feature to finish.

1.  Switch to `main`: `git checkout main` & `git pull`.
2.  Create a hotfix branch: `git checkout -b hotfix/login-error`.
3.  Fix the bug.
4.  Test locally.
5.  Push & Merge immediately.

---

## 🧪 Managing Environments (Local vs. Prod)

You don't need to change code to switch environments. We set this up using **Environment Variables**.

| Feature | Local Environment | Production (Railway) |
| :--- | :--- | :--- |
| **Database** | `localhost:5432/finaldb` | Railway PostgreSQL Plugin |
| **Backend Port** | `8080` (Default) | Dynamic `$PORT` |
| **Frontend API** | `localhost:8080` | `https://your-backend.up.railway.app` |
| **Config File** | `environment.development.ts` | `environment.prod.ts` |

**How it works:**
*   **Locally:** Angular uses `environment.ts` (dev). Spring Boot uses `application.properties` default values.
*   **Production:** Docker builds with `npm run build --prod`, forcing Angular to use `environment.prod.ts`. Spring Boot sees the `SPRING_DATASOURCE_URL` provided by Railway and overrides the local defaults.

---

## 📝 Summary Checklist

- [ ] Am I on `main`? -> **STOP**. Create a branch.
- [ ] Did I test locally? -> **Yes**.
- [ ] Did I commit my changes? -> **Yes**.
- [ ] Did I merge to `main` via GitHub? -> **Yes**.
- [ ] Check Railway dashboard for deployment status.
