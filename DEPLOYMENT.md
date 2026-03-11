# Prok Professional Networking - Deployment Guide

This guide will walk you through deploying your Prok application to Render.

## 1. Prerequisites

- A [Render](https://render.com/) account.
- A [GitHub](https://github.com/) account with your Prok project pushed to a repository.

## 2. Backend Deployment (Render Web Service)

### 2.1. Create a PostgreSQL Database

1.  Go to your Render Dashboard.
2.  Click **New +** and select **PostgreSQL**.
3.  Choose a name for your database (e.g., `prok-database`).
4.  Note down the **Internal Connection URL**. You'll need it later.

### 2.2. Create a Web Service for the Backend

1.  In your Render Dashboard, click **New +** and select **Web Service**.
2.  Connect your GitHub repository and select your Prok project.
3.  Configure the service:
    *   **Name**: `prok-backend` (or any name you prefer).
    *   **Root Directory**: `app/backend`.
    *   **Runtime**: `Python 3`.
    *   **Build Command**: `pip install -r requirements.txt`.
    *   **Start Command**: `gunicorn main:app`.
4.  Add the following **Environment Variables**:
    *   `DATABASE_URL`: The **Internal Connection URL** of your PostgreSQL database.
    *   `SECRET_KEY`: A long, random string for Flask's secret key.
    *   `JWT_SECRET_KEY`: A long, random string for JWT signing.
    *   `ALLOWED_ORIGINS`: The URL of your frontend deployment (you'll get this in the next step, you can come back and add it later).
5.  Click **Create Web Service**.

## 3. Frontend Deployment (Render Static Site)

### 3.1. Create a Static Site for the Frontend

1.  In your Render Dashboard, click **New +** and select **Static Site**.
2.  Connect your GitHub repository and select your Prok project.
3.  Configure the service:
    *   **Name**: `prok-frontend` (or any name you prefer).
    *   **Root Directory**: `app/frontend`.
    *   **Build Command**: `npm install && npm run build`.
    *   **Publish Directory**: `dist`.
4.  Add the following **Environment Variable**:
    *   `VITE_API_URL`: The URL of your backend service (e.g., `https://prok-backend.onrender.com`).
5.  Click **Create Static Site**.

## 4. Final Configuration

1.  Once your frontend is deployed, copy its URL.
2.  Go back to your backend service's **Environment** settings.
3.  Update the `ALLOWED_ORIGINS` variable with your frontend's URL.

Your application should now be deployed and accessible at your frontend's URL.
