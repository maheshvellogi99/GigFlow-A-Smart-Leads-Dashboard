# Smart Leads Dashboard

> **Full-Stack Internship Assignment Submission by Mahesh Vellogi**

## Project Overview

**Smart Leads Dashboard (GigFlow)** is a secure, role-based Customer Relationship Management (CRM) application designed to streamline the sales pipeline. It provides a robust interface for managing leads, complete with advanced filtering, data ownership isolation, and automated CSV exporting. Built with a decoupled architecture, it leverages a modern React frontend and a scalable Node.js backend.

## Live Demo

🚀 **[View Live Application](https://gigflow007.vercel.app)**

## Core Features

- **JWT Authentication & Role-Based Access Control**: Secure login/registration flows defining distinct permissions for `Admin` and `Sales User` roles.
- **Data Ownership & Isolation**: Sales Users operate in isolated environments, restricted to viewing, editing, and exporting only the leads they personally created. Admins retain a global view with a dedicated "Created By" attribution column.
- **Advanced Dynamic Filtering & Server-Side Pagination**: Highly optimized MongoDB queries allowing instantaneous filtering by Status, Source, and Search criteria without overloading the client.
- **Debounced Search**: Optimized API utilization using debounced keystroke listeners for real-time lead searching.
- **CSV Export**: Dedicated backend controller to stream queried data directly into downloadable CSV reports.
- **Light/Dark Mode Theme**: Beautiful, accessible, and dynamic TailwindCSS interface with persistent user theme preferences via LocalStorage.
- **Secure Admin Provisioning**: Registration for the Admin role is strictly protected by a required backend `ADMIN_SECRET` key to prevent unauthorized escalation.

## Tech Stack

### Frontend
- **React (Vite)**
- **TypeScript** (Strict Mode, zero `any`)
- **TailwindCSS**
- **Lucide React** (Icons)
- **Axios**

### Backend
- **Node.js & Express**
- **TypeScript**
- **MongoDB Atlas & Mongoose**
- **JSON Web Tokens (JWT) & bcryptjs**
- **Docker & Docker Compose**

---

## Environment Variables

### Backend (`backend/.env`)

| Variable | Description |
|---|---|
| `PORT` | The port the Express server will run on (e.g., `5001`) |
| `MONGO_URI` | Your MongoDB Atlas or local connection string |
| `JWT_SECRET` | A secure, random string for signing JSON Web Tokens |
| `ADMIN_SECRET` | The secret key required to register a new Admin account |
| `FRONTEND_URL` | The URL of the frontend for CORS configuration (e.g., `https://gigflow007.vercel.app`) |

### Frontend (`frontend/.env`)

| Variable | Description |
|---|---|
| `VITE_API_URL` | The base URL of the backend API (e.g., `http://localhost:5001/api`) |

---

## API Documentation

| Method | Endpoint | Description | Access / Role |
|:---:|---|---|---|
| `POST` | `/api/auth/register` | Register a new user | Public |
| `POST` | `/api/auth/login` | Authenticate user & receive JWT | Public |
| `GET` | `/api/auth/me` | Fetch currently authenticated user profile | Protected (All) |
| `GET` | `/api/leads` | Get paginated list of leads (Filtered by ownership) | Protected (All) |
| `POST` | `/api/leads` | Create a new lead | Protected (All) |
| `GET` | `/api/leads/:id` | Fetch specific lead details | Protected (Owner/Admin) |
| `PUT` | `/api/leads/:id` | Update an existing lead | Protected (Owner/Admin) |
| `DELETE` | `/api/leads/:id` | Delete a lead permanently | Protected (Admin Only) |
| `GET` | `/api/leads/export/csv` | Download CSV of leads (Filtered by ownership) | Protected (All) |

---

## Local Setup Instructions

1. **Clone the repository** and navigate to the project directory.

2. **Backend Setup**:
   ```bash
   cd backend
   npm install
   # Create a .env file and populate it using the variables listed above
   npm run dev
   ```

3. **Frontend Setup**:
   ```bash
   cd frontend
   npm install
   # Create a .env file and set VITE_API_URL
   npm run dev
   ```

4. **Access the application**: Open `http://localhost:5173` in your browser.

## Docker Setup Instructions

You can effortlessly spin up the entire application stack using Docker Compose. Ensure you have Docker Desktop installed and running.

1. Navigate to the root of the project (where `docker-compose.yml` is located).
2. Ensure both `backend/.env` and `frontend/.env` are properly configured.
3. Build and start the containers:
   ```bash
   docker-compose up --build -d
   ```
4. To stop the containers:
   ```bash
   docker-compose down
   ```
