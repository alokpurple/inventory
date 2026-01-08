# 🚀 Railway Deployment Guide

This guide will walk you through deploying your **Inventory Management System** (Spring Boot Backend + Angular Frontend + PostgreSQL) on [Railway](https://railway.app/).

## 📋 Prerequisites

1.  **GitHub Account:** Ensure your project is pushed to a GitHub repository.
2.  **Railway Account:** Sign up at [railway.app](https://railway.app/).

---

## 🛠 Step 1: Create a Project & Database

1.  Log in to Railway and click **"New Project"**.
2.  Select **"Provision PostgreSQL"**.
3.  This will create a project with a database service.
    *   Click on the **PostgreSQL** card.
    *   Go to the **Variables** tab.
    *   Note down the values (or keep this tab open), especially `DATABASE_URL`, `PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGPORT`.

---

## 🔙 Step 2: Deploy the Backend (Spring Boot)

1.  In the same project, click **"New"** → **"GitHub Repo"**.
2.  Select your repository.
3.  **Configuring the Service:**
    *   Click on the newly created service card (it might be building and failing, that's okay for now).
    *   Go to **Settings** → **General**.
    *   Scroll down to **Root Directory** and set it to `/backend`.
4.  **Environment Variables:**
    *   Go to the **Variables** tab.
    *   Add the following variables (you can reference the Postgres service variables using `${{ Postgres.VARIABLE }}`):

    | Variable Name | Value |
    | :--- | :--- |
    | `PORT` | `8080` |
    | `SPRING_DATASOURCE_URL` | `jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}` |
    | `SPRING_DATASOURCE_USERNAME` | `${{Postgres.PGUSER}}` |
    | `SPRING_DATASOURCE_PASSWORD` | `${{Postgres.PGPASSWORD}}` |

5.  **Public Networking:**
    *   Go to **Settings** → **Networking**.
    *   Click **"Generate Domain"**.
    *   Copy this URL (e.g., `https://backend-production.up.railway.app`). You will need it for the frontend.

---

## 🎨 Step 3: Deploy the Frontend (Angular)

1.  Click **"New"** → **"GitHub Repo"**.
2.  Select your repository (again).
3.  **Configuring the Service:**
    *   Click on the new service card.
    *   Go to **Settings** → **General**.
    *   Set **Root Directory** to `/frontend`.
4.  **Environment Variables:**
    *   Go to the **Variables** tab.
    *   Add the following variable:

    | Variable Name | Value |
    | :--- | :--- |
    | `API_URL` | The Backend URL you copied earlier (e.g., `https://backend-production.up.railway.app`) |

    *(Note: Do not add a trailing slash `/` to the URL).*

5.  **Public Networking:**
    *   Go to **Settings** → **Networking**.
    *   Click **"Generate Domain"**.
    *   This is your live application URL!

---

## ✅ Verification

1.  Visit your **Frontend URL**.
2.  Try to **Register** a new user.
3.  If successful, the Frontend is talking to the Backend, and the Backend is writing to the Database.

## 🔧 Troubleshooting

*   **Build Failures:** Check the "Deploy Logs" in Railway. Ensure `pom.xml` (backend) or `package.json` (frontend) are valid.
*   **Database Connection Error:** Verify the `SPRING_DATASOURCE_URL` format. It must start with `jdbc:postgresql://`.
*   **CORS Issues:** If the frontend says "Network Error" or "CORS", you might need to update the allowed origins in the Backend code (`SecurityConfig.java`) to match your Railway Frontend domain.
    *   *Quick Fix:* Update `SecurityConfig.java` to allow the new domain or `*` (for testing).

    ```java
    configuration.setAllowedOrigins(List.of("http://localhost:4200", "https://your-frontend-domain.up.railway.app"));
    ```
