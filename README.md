# 🤖 AI Smart Inventory & Supply Chain System

![Live Project](https://img.shields.io/badge/Live_Site-Vercel-blue) ![Backend API](https://img.shields.io/badge/API-Render-green) ![License](https://img.shields.io/badge/License-MIT-purple)

> A production-ready, MERN-stack Inventory and Supply Chain Management System featuring Role-Based Access Control (RBAC), Global Gemini AI Integration, Real-Time Dashboard Analytics, and Advanced Image Cloud Storage.

---

## 🌟 Project Overview

The **AI Smart Inventory & Supply Chain System** is designed to solve complex warehouse and vendor management problems. It allows businesses to track products, manage categories, issue purchase orders, and monitor critical supplier networks under a secure, role-restricted environment.

An integrated **Google Gemini AI Assistant** acts as a smart co-pilot, automatically generating product descriptions and answering warehouse queries in real-time.

---

## 🔥 Features List

*   **🔒 Strict Account Gating:** New registrations are automatically placed in a `Pending` state. Users cannot access the dashboard until an Admin explicitly updates their status to `Active`.
*   **🔒 Role-Based Access Control (RBAC):** Strict separation of `Admin` and `Staff` roles. Admins have destructive privileges (Delete), approve accounts, and oversee Activity Logs; Staff can only read, create, and update entries.
*   **🤖 AI Copilot (Gemini API):** A global AI chatbot for instant inventory querying and a one-click AI product description generator.
*   **📊 Dynamic Dashboard Analytics:** Real-time data aggregations displaying active low-stock alerts, total revenue, and a live "Recent Transactions" auditor table.
*   **☁️ Cloudinary Image Uploads:** Intercepts frontend image uploads via `multer` and streams them securely to Cloudinary to keep the MongoDB instance lightweight.
*   **📧 Secure Authentication:** JWT-based sessions, `bcrypt` password hashing, robust frontend/backend session validation, and real-time OTP NodeMailer verifications.
*   **📦 Full Supply Chain CRUD:** Complete management structures for **Products**, **Categories**, **Suppliers**, and **Orders** (including real-time status updates and order editing).
*   **🌗 Premium UX/UI:** Designed with a sleek Dark/Light mode toggle, smooth React-Toastify notifications, and responsive Bootstrap grids.

---

## 💻 Tech Stack

### Frontend (Client-Side)
*   **React + Vite:** Lightning-fast HMR and optimized production build.
*   **React Bootstrap / Vanilla CSS:** Responsive, modular, and dynamic UI themes.
*   **React Router DOM:** Secure SPA client-side routing.
*   **Axios:** Configured with JWT interceptors for authenticated API requests.

### Backend (Server-Side)
*   **Node.js & Express.js:** RESTful API architecture.
*   **MongoDB & Mongoose:** NoSQL database with complex relational aggregations.
*   **Google Generative AI:** Integrated `@google/generative-ai` SDK.
*   **Multer + Cloudinary:** Optimized streaming media storage.
*   **Nodemailer:** Automated SMTP email dispatch system.

---

## 📂 Folder Structure

```text
📦 AI-Smart-Inventory
 ┣ 📂 backend
 ┃ ┣ 📂 src
 ┃ ┃ ┣ 📂 config        # Env & DB setups (cloudinary.js, db.js)
 ┃ ┃ ┣ 📂 controllers   # Core Business Logic (auth, products, ai, etc.)
 ┃ ┃ ┣ 📂 middlewares   # Auth/Role Guards & Error Handlers
 ┃ ┃ ┣ 📂 models        # Mongoose Schemas (User, Product, Order)
 ┃ ┃ ┣ 📂 routes        # API Endpoint definitions
 ┃ ┃ ┗ 📂 utils         # Email senders, helpers
 ┃ ┗ 📜 server.js       # Express Server Entry Point
 ┃
 ┗ 📂 frontend
   ┣ 📂 public
   ┣ 📂 src
   ┃ ┣ 📂 components    # Reusable UI (Cards, Modals, Chatbot)
   ┃ ┣ 📂 context       # Global State (Auth, Theme)
   ┃ ┣ 📂 pages         # Route Views (Dashboard, Products, Login)
   ┃ ┣ 📂 services      # Axios API Callers
   ┃ ┗ 📜 App.jsx       # Root Component
   ┗ 📜 vite.config.js
```

---

## ⚙️ Setup Instructions (Local Development)

### 1. Clone the Repository
```bash
git clone https://github.com/your-username/AI-Smart-Inventory.git
cd AI-Smart-Inventory
```

### 2. Install Dependencies
Open two separate terminal windows:
```bash
# Terminal 1: Backend
cd backend
npm install

# Terminal 2: Frontend
cd frontend
npm install
```

### 3. Environment Setup
See the **Environment Variables Guide** below. Create a `.env` file in both `backend/` and `frontend/` folders.

### 4. Run the Servers
```bash
# Backend (Runs on http://localhost:5000)
cd backend
npm start

# Frontend (Runs on http://localhost:5173)
cd frontend
npm run dev
```

---

## 🔐 Environment Variables Guide

### `backend/.env`
Create this file in the `backend/` root directory.
```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/inventory_db
JWT_SECRET=your_super_secret_jwt_key_here
FRONTEND_URL=http://localhost:5173

# Email Configurations (For OTP)
EMAIL_USER=your_gmail_address@gmail.com
EMAIL_PASS=your_gmail_app_password

# AI Integrations
AI_API_KEY=your_google_gemini_api_key

# Cloudinary Setup (For Image Uploads)
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

### `frontend/.env`
Create this file in the `frontend/` root directory.
```env
VITE_API_URL=http://localhost:5000/api
```

---

## 🚀 Deployment Instructions

### 1. Deploying the Backend (Render / Railway)
1. Push your code to GitHub.
2. Go to **Render** or **Railway** and connect your GitHub account.
3. Select the `backend` directory as the Root Directory.
4. Set the Build Command: `npm install`
5. Set the Start Command: `npm start`
6. **CRITICAL:** Copy literally every variable from your `backend/.env` into the platform's "Environment Variables" settings.
7. Deploy. You will receive a live API URL like `https://my-backend.onrender.com`.

### 2. Deploying the Frontend (Vercel / Netlify)
1. Go to **Vercel** or **Netlify** and import your GitHub repository.
2. Select the `frontend` directory as the Root Directory.
3. Set the Framework Preset to Vite/React.
4. Provide the Environment Variable: 
   `VITE_API_URL = https://my-backend.onrender.com/api` *(Use your deployed backend URL from Step 1)*
5. Deploy.

### 3. Final CORS configuration
* Once your Frontend is verified live on Vercel (e.g. `https://my-app.vercel.app`), go back to your Backend hosting settings and update `FRONTEND_URL` to match that Vercel link so the backend accepts requests.

---

## 🔌 API Documentation (Key Endpoints)

| Method | Endpoint | Description | Role Required |
|--------|----------|-------------|---------------|
| `POST` | `/api/auth/login` | Authenticate User & Issue JWT | Public |
| `GET`  | `/api/products` | Fetch all products | Auth (Staff/Admin) |
| `POST` | `/api/products` | Create a product via `multer` | Auth (Staff/Admin) |
| `DELETE`| `/api/products/:id` | Delete a product | **Admin Only** |
| `GET`  | `/api/analytics/dashboard`| Aggregate KPI & sales metrics | Auth (Staff/Admin) |
| `POST` | `/api/ai/generate` | Generate product description | Auth (Staff/Admin) |

---

## 🗄️ Sample MongoDB Seed Data

To quickly test the application, here is a JSON format of sample collections:

### Admin User Document
```json
{
  "name": "Ajay Pradeep",
  "email": "ajaypradeep943@gmail.com",
  "role": "Admin",
  "password": "$2b$10$hashed_password_string_here"
}
```

### Product Document
```json
{
  "name": "Sony PlayStation 5",
  "sku": "SKU-PS5-100",
  "category": "69aefcf6288726eae1b1828c",
  "supplier": "69d37fb8d37cfaeda4f9491f",
  "description": "Next generation gaming console featuring 4K UHD.",
  "price": 499.99,
  "stockLevel": 15,
  "reorderPoint": 20,
  "images": ["https://res.cloudinary.com/demo/image/upload/ps5.jpg"]
}
```

---

## 📸 Screenshots

*(Replace these placeholders with actual screenshots of your deployed app by adding images to your repository!)*

1. **Dark Mode Dashboard:**  
   `![Dashboard](link-to-your-image.png)`
2. **Global AI Chatbot Validation:**  
   `![AI Chatbot](link-to-your-image.png)`
3. **Role-Based Access (Hidden Delete Buttons):**  
   `![RBAC](link-to-your-image.png)`

---

## 🔗 Live Project Links

*   **Live Web Portal:** `[Insert Vercel Link Here]`
*   **Live API Server:** `[Insert Render Link Here]`
*   **GitHub Repository:** `[Insert GitHub Repo Link Here]`
