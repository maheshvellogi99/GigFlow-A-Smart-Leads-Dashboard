# GigFlow — Setup & Deployment Instructions

This guide walks you through setting up the GigFlow application on your local machine, running it via Docker, and deploying it to production using Vercel (Frontend) and Render (Backend).

---

## 1. Environment Variables

Before starting the application, ensure you have configured your environment variables. Create a `.env` file in both the `frontend` and `backend` directories.

### `backend/.env`
```env
# Server Port
PORT=5001

# MongoDB Connection String (Atlas or Local)
MONGO_URI=mongodb+srv://<username>:<password>@cluster0.mongodb.net/gigflow?retryWrites=true&w=majority

# JWT Authentication Secret (Use a strong random string)
JWT_SECRET=super_secret_jwt_key_example

# Admin Provisioning Secret (Required to register as an Admin)
ADMIN_SECRET=GigFlowAdmin2026!

# Allowed Frontend Origin for CORS (Use localhost for dev, Vercel URL for prod)
FRONTEND_URL=http://localhost:5173
```

### `frontend/.env`
```env
# Backend API Base URL
VITE_API_URL=http://localhost:5001/api
```

---

## 2. Local Setup (Manual)

If you prefer to run the Node.js and React servers directly on your machine without Docker:

### Prerequisites
- Node.js (v18 or higher)
- MongoDB (Local installation or MongoDB Atlas cluster)

### Backend Initialization
1. Open a terminal and navigate to the backend directory:
   ```bash
   cd backend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the development server (runs with `ts-node-dev` for hot-reloading):
   ```bash
   npm run dev
   ```
   *The server should report that it is running on port 5001 and connected to MongoDB.*

### Frontend Initialization
1. Open a new terminal and navigate to the frontend directory:
   ```bash
   cd frontend
   ```
2. Install dependencies:
   ```bash
   npm install
   ```
3. Start the Vite development server:
   ```bash
   npm run dev
   ```
4. Access the application in your browser at `http://localhost:5173`.

---

## 3. Local Setup (Docker Compose)

You can spin up both the frontend and backend instantly using Docker.

### Prerequisites
- Docker Desktop installed and running.

### Instructions
1. Ensure both `.env` files are created as outlined in Section 1.
2. From the root of the project (where `docker-compose.yml` is located), run:
   ```bash
   docker-compose up --build -d
   ```
3. Docker will build the images and start both containers in the background (`-d`).
4. Access the frontend at `http://localhost:5173`.
5. To view logs:
   ```bash
   docker-compose logs -f
   ```
6. To shut down the containers:
   ```bash
   docker-compose down
   ```

---

## 4. Production Deployment

The project is structured as a monorepo, making it highly compatible with modern cloud hosting platforms like Vercel and Render.

### Step A: Deploy Backend to Render
1. Push your repository to GitHub.
2. Log into [Render](https://render.com/) and create a new **Web Service**.
3. Connect your GitHub repository.
4. Configure the service:
   - **Root Directory**: `backend` *(Crucial step!)*
   - **Environment**: `Node`
   - **Build Command**: `npm install && npm run build`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   - `MONGO_URI`
   - `JWT_SECRET`
   - `ADMIN_SECRET`
   - *(Wait to add `FRONTEND_URL` until step B is complete)*
6. Click **Create Web Service** and wait for the deployment to finish. Copy the provided `.onrender.com` URL.

### Step B: Deploy Frontend to Vercel
1. Log into [Vercel](https://vercel.com/) and click **Add New... > Project**.
2. Import your GitHub repository.
3. Configure the project:
   - **Framework Preset**: `Vite`
   - **Root Directory**: `frontend` *(Crucial step!)*
4. Under **Environment Variables**, add:
   - `VITE_API_URL`: Set this to your Render URL + `/api` (e.g., `https://gigflow-backend.onrender.com/api`)
5. Click **Deploy**. Vercel will automatically run `tsc -b && vite build`.
6. Once deployed, copy your `.vercel.app` domain.

### Step C: Finalize CORS Configuration
1. Go back to your Render Dashboard for the backend web service.
2. Navigate to the **Environment** tab.
3. Add the `FRONTEND_URL` variable and set it to your Vercel URL (e.g., `https://gigflow007.vercel.app`).
4. Save the changes. Render will redeploy your backend with the updated CORS policy, securely linking the two services.

Congratulations! Your Smart Leads Dashboard is now live.
