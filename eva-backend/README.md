# EVA Backend — Teacher Evaluation System API

REST API for the EVA Teacher Evaluation System at Wachemo University (WCU), built with Node.js, Express, and MongoDB (Mongoose).

## Features

- **Authentication & Authorization**: JWT-based authentication with role-based access control (`student` and `admin`).
- **Student Flow**: Browse teachers, fetch active semester courses, submit evaluations across 6 academic criteria, view personal evaluation history with offline queue synchronization.
- **Admin Dashboard**: System-wide analytics, hierarchical filtering (College -> Program -> Year -> Semester), teacher and student management, moderation of evaluations, and CSV data export.
- **Resilient Health Check**: `/api/health` endpoint with real-time MongoDB connection state and server uptime monitoring.

---

## Getting Started

### 1. Prerequisites
- Node.js (v18 or higher)
- MongoDB (Local instance or MongoDB Atlas URI)

### 2. Environment Variables
Create a `.env` file in this directory based on `.env.example`:

```env
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/eva_db
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
```

### 3. Installation
```bash
npm install
```

### 4. Seed Database (Optional)
Populate sample users (student and admin) and teachers across university colleges:
```bash
npm run seed
```
**Default Credentials created by seed:**
- **Student**: `student@eva.com` / `password123`
- **Admin**: `admin@eva.com` / `password123`

### 5. Running the Server
- **Development (auto-reload)**:
  ```bash
  npm run dev
  ```
- **Production**:
  ```bash
  npm start
  ```

---

## API Endpoints Overview

| Method | Endpoint | Access | Description |
|---|---|---|---|
| `GET` | `/api/health` | Public | Service health & database status |
| `POST` | `/api/auth/register` | Public | Register new student account |
| `POST` | `/api/auth/login` | Public | Authenticate user & get JWT token |
| `GET` | `/api/teachers` | Protected | List teachers (filters: college, program, year, semester, search) |
| `GET` | `/api/teachers/:id` | Protected | Get teacher details by ID |
| `POST` | `/api/teachers` | Admin | Create new teacher |
| `PUT` | `/api/teachers/:id` | Admin | Update teacher |
| `DELETE` | `/api/teachers/:id` | Admin | Delete teacher & cascade evaluations |
| `POST` | `/api/evaluations` | Protected | Submit a teacher evaluation |
| `GET` | `/api/evaluations/me` | Protected | Get current user's evaluations |
| `GET` | `/api/evaluations/analytics` | Protected | College-wide rating analytics |
| `GET` | `/api/evaluations/:id` | Protected | Get evaluation by ID |
| `PUT` | `/api/evaluations/:id` | Protected | Update own evaluation |
| `DELETE` | `/api/evaluations/:id` | Protected | Delete own evaluation |
| `GET` | `/api/admin/dashboard` | Admin | Overall stats & top/lowest rated teachers |
| `GET` | `/api/admin/users` | Admin | List all registered users |
| `PUT` | `/api/admin/users/:id/role` | Admin | Toggle user role (`student` <-> `admin`) |
| `DELETE` | `/api/admin/users/:id` | Admin | Delete a user |
| `GET` | `/api/admin/evaluations` | Admin | Moderation list of all evaluations |
| `DELETE` | `/api/admin/evaluations/:id` | Admin | Delete an evaluation & recalculate ratings |
| `GET` | `/api/admin/organized-data` | Admin | Multi-level filtered teachers, students & evals |
| `GET` | `/api/admin/export` | Admin | Structured data for CSV export |
| `GET` | `/api/admin/settings` | Protected | Fetch system settings |
| `PUT` | `/api/admin/settings` | Admin | Update evaluation period & anonymous mode |

---

## Deployment (Render)

1. Push your repository to GitHub.
2. In [Render Dashboard](https://dashboard.render.com), create a new **Web Service**.
3. Connect your GitHub repository (`eva-backend`).
4. Set:
   - **Environment**: `Node`
   - **Build Command**: `npm install`
   - **Start Command**: `npm start`
5. Under **Environment Variables**, add:
   - `MONGO_URI`: Your MongoDB Atlas connection URI.
   - `JWT_SECRET`: A secure random secret string.
   - `NODE_ENV`: `production`
6. Click **Create Web Service**. Your API will be live at `https://<service-name>.onrender.com`.
