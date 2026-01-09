# 🚀 Railway Deployment Guide

This guide will walk you through deploying your **Inventory Management System** (Spring Boot Backend + Angular Frontend + PostgreSQL) on [Railway](https://railway.app/).

## 📋 Prerequisites

1.  **GitHub Account:** Ensure your project is pushed to a GitHub repository.
2.  **Railway Account:** Sign up at [railway.app](https://railway.app/).

> **⚠️ Important Note:** Railway uses ephemeral (temporary) storage. For file uploads (images, PDFs), you must use cloud storage like Cloudinary or AWS S3. See [File Storage Limitations](#️-important-file-storage-limitations) section below.

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
    *   Add the following variables (Railway provides autocomplete dropdowns - you can reference the Postgres service variables using `${{Postgres.VARIABLE}}`):

    | Variable Name | Value |
    | :--- | :--- |
    | `PORT` | `8080` |
    | `SPRING_DATASOURCE_URL` | `jdbc:postgresql://${{Postgres.PGHOST}}:${{Postgres.PGPORT}}/${{Postgres.PGDATABASE}}` |
    | `SPRING_DATASOURCE_USERNAME` | `${{Postgres.PGUSER}}` |
    | `SPRING_DATASOURCE_PASSWORD` | `${{Postgres.PGPASSWORD}}` |
    | `CORS_ALLOWED_ORIGINS` | `http://localhost:4200` (will update this later with your Railway frontend URL) |

    > **Note:** The `CORS_ALLOWED_ORIGINS` variable allows the backend to accept requests from your frontend. You can specify multiple origins separated by commas.

5.  **Public Networking:**
    *   Go to **Settings** → **Networking** → **Public Networking**.
    *   Click **"Generate Domain"**.
    *   Railway will auto-detect the port (8080) from your Dockerfile.
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
    *   Add the following variables:

    | Variable Name | Value |
    | :--- | :--- |
    | `PORT` | `8080` |
    | `API_URL` | The Backend URL you copied earlier (e.g., `https://backend-production.up.railway.app`) |

    > **Important Notes:**
    > - Do not add a trailing slash `/` to the `API_URL`.
    > - The `PORT` variable is required because the nginx server is configured to listen on port 8080 for Railway.

5.  **Public Networking:**
    *   Go to **Settings** → **Networking** → **Public Networking**.
    *   Click **"Generate Domain"**.
    *   Railway will auto-detect the port (8080) from your nginx configuration.
    *   This is your live application URL!

---

## ✅ Step 4: Update CORS Configuration

After deploying the frontend and getting its Railway URL, you need to update the backend's CORS configuration:

1.  Go back to your **Backend service** in Railway.
2.  Navigate to the **Variables** tab.
3.  Update the `CORS_ALLOWED_ORIGINS` variable to include your frontend URL:
    ```
    http://localhost:4200,https://your-frontend-domain.up.railway.app
    ```
    > **Note:** Replace `your-frontend-domain.up.railway.app` with your actual frontend Railway domain. Multiple origins should be comma-separated with no spaces.

4.  The backend service will automatically redeploy with the updated CORS settings.

---

## ✅ Verification

1.  Visit your **Frontend URL**.
2.  Try to **Register** a new user.
3.  If successful, the Frontend is talking to the Backend, and the Backend is writing to the Database.

## 🔧 Troubleshooting

### Build Failures
*   Check the **"Deploy Logs"** in Railway for detailed error messages.
*   Ensure `pom.xml` (backend) or `package.json` (frontend) are valid.
*   Verify that the **Root Directory** is correctly set (`/backend` or `/frontend`).
*   Check that your Dockerfiles are present in the correct directories.

### Database Connection Errors
*   Verify the `SPRING_DATASOURCE_URL` format starts with `jdbc:postgresql://`.
*   Ensure all database variables (`PGHOST`, `PGUSER`, `PGPASSWORD`, `PGDATABASE`, `PGPORT`) are correctly referenced using the `${{Postgres.VARIABLE}}` syntax.
*   Check that the PostgreSQL service is running in your Railway project.

### CORS Issues
If the frontend shows "Network Error", "CORS error", or "Access-Control-Allow-Origin" errors:

1.  **Check the `CORS_ALLOWED_ORIGINS` environment variable** in your backend service:
    *   Go to Backend service → **Variables** tab
    *   Verify `CORS_ALLOWED_ORIGINS` includes your frontend Railway domain
    *   Format: `http://localhost:4200,https://your-frontend-domain.up.railway.app`
    *   **Important:** No spaces between comma-separated origins

2.  **Update and redeploy:**
    *   After updating `CORS_ALLOWED_ORIGINS`, Railway will automatically redeploy the backend
    *   Wait for the deployment to complete before testing

3.  **Verify the configuration:**
    *   The backend uses the `CORS_ALLOWED_ORIGINS` environment variable (see `SecurityConfig.java:36`)
    *   No code changes are needed - only update the environment variable

### Frontend Shows Blank Page or Errors
*   Check that `API_URL` is set correctly without a trailing slash
*   Verify `PORT` is set to `8080` for the frontend service
*   Check nginx logs in Railway deploy logs for port binding issues

### 502 Bad Gateway Error
*   Ensure both frontend and backend have `PORT=8080` set
*   Verify nginx is configured to listen on port 8080 (check `frontend/nginx.conf`)
*   Check that the service is actually running in Railway deploy logs

---

## 📝 Additional Notes

### Railway Features Used
*   **Monorepo Support:** This project uses isolated monorepo configuration with separate root directories for backend and frontend
*   **Variable References:** Railway's `${{SERVICE.VARIABLE}}` syntax allows services to reference each other's environment variables
*   **Auto-deploy:** Railway automatically redeploys services when you push to your GitHub repository
*   **Dockerfile Detection:** Railway automatically detects and uses Dockerfiles in your root directories

### Environment Variable Summary

**Backend Service:**
| Variable | Purpose |
| :--- | :--- |
| `PORT` | Port for Spring Boot to listen on (8080) |
| `SPRING_DATASOURCE_URL` | PostgreSQL connection URL |
| `SPRING_DATASOURCE_USERNAME` | Database username |
| `SPRING_DATASOURCE_PASSWORD` | Database password |
| `CORS_ALLOWED_ORIGINS` | Comma-separated list of allowed frontend origins |

**Frontend Service:**
| Variable | Purpose |
| :--- | :--- |
| `PORT` | Port for nginx to listen on (8080) |
| `API_URL` | Backend API URL for the Angular app |

### Useful Railway Commands
*   View all services in project: Check the Project Canvas
*   Redeploy a service: Go to service → Deployments tab → Click "Redeploy"
*   View logs: Click on service → Deployments tab → Click on latest deployment
*   Rollback: Go to Deployments tab → Click three dots on previous deployment → "Redeploy"

---

---

## ⚠️ Important: File Storage Limitations

### Railway Uses Ephemeral Storage

**Critical Warning:** Railway containers use **ephemeral (temporary) file storage**, which means:

❌ **Files uploaded to your container are DELETED when:**
- You deploy a new version of your application
- Railway restarts your service
- Railway scales or moves your container

❌ **This affects:**
- User-uploaded images (profile pictures, product images)
- PDF documents (invoices, reports, receipts)
- Any files saved to the container's file system

### ✅ Solution: Use Cloud Storage

For persistent file storage, you **must** use external cloud storage services:

**Recommended Options:**
1. **Cloudinary** - Best for images (Free tier: 25GB storage)
2. **AWS S3** - Industry standard, any file type (Free tier: 5GB)
3. **Supabase Storage** - Modern alternative (Free tier: 1GB)

**How it works:**
- Upload files to cloud storage (Cloudinary/S3)
- Store the **file URL** in your PostgreSQL database
- Display files by loading from the URL

📖 **See the complete guide:** [FILE_STORAGE_GUIDE.md](FILE_STORAGE_GUIDE.md)

**Important:** Implement cloud storage **before** adding file upload features to your application.

---

## 🎉 Success!

Once everything is deployed and verified:
*   Your backend is running on Railway with PostgreSQL
*   Your frontend is served via nginx on Railway
*   CORS is properly configured for secure communication
*   SSL certificates are automatically managed by Railway
*   ⚠️ Remember: Use cloud storage for file uploads (see warning above)

**Your Inventory Management System is now live! 🚀**
