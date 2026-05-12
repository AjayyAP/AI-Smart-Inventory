# AI Smart Inventory

A MERN stack inventory and wholesale order management system for tracking products, stock, suppliers, customer payments, low-stock alerts, and activity logs. The app includes role-based access, email OTP verification, AI-assisted inventory features, Cloudinary product images, and a dashboard focused on paid revenue, pending balances, and reorder needs.

## Features

- Secure authentication with JWT, bcrypt password hashing, email OTP verification, and password reset.
- Admin and Staff roles with protected routes and admin-only destructive actions.
- Admin approval flow for new staff accounts.
- Product, category, supplier, and wholesale order management.
- Product image uploads through Cloudinary.
- Automatic stock deduction when wholesale orders are created.
- Low-stock tracking using `stockLevel <= reorderPoint`.
- Order payment tracking with paid amount, pending balance, payment method, and payment date.
- Dashboard KPIs for products, orders, suppliers, paid revenue, low-stock products, recent transactions, and pending payments.
- AI tools for product descriptions, reorder suggestions, and inventory chatbot support.
- Activity logs for important admin and inventory actions.
- Responsive React Bootstrap interface with dark and light theme support.

## Tech Stack

### Frontend

- React 19
- Vite
- React Router
- React Bootstrap
- React Toastify
- Axios
- Recharts

### Backend

- Node.js
- Express
- MongoDB
- Mongoose
- JWT
- Multer
- Cloudinary
- Nodemailer
- Google Generative AI

## Project Structure

```text
AI-Smart-Inventory/
  backend/
    server.js
    src/
      app.js
      config/
      controllers/
      middlewares/
      models/
      routes/
      services/
      utils/
  frontend/
    index.html
    src/
      components/
      context/
      pages/
      services/
      App.jsx
      main.jsx
```

## Getting Started

### Prerequisites

- Node.js
- npm
- MongoDB database
- Cloudinary account for product images
- Gmail app password or SMTP-compatible credentials for OTP email
- Google Gemini API key for AI features

### Install Dependencies

```bash
cd backend
npm install

cd ../frontend
npm install
```

### Environment Variables

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb+srv://<username>:<password>@cluster.mongodb.net/inventory_db
JWT_SECRET=your_jwt_secret
FRONTEND_URL=http://localhost:5173

EMAIL_USER=your_email@gmail.com
EMAIL_PASS=your_gmail_app_password

AI_API_KEY=your_google_gemini_api_key

CLOUDINARY_CLOUD_NAME=your_cloudinary_cloud_name
CLOUDINARY_API_KEY=your_cloudinary_api_key
CLOUDINARY_API_SECRET=your_cloudinary_api_secret
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
```

### Run Locally

Backend:

```bash
cd backend
npm start
```

Frontend:

```bash
cd frontend
npm run dev
```

Default local URLs:

- Frontend: `http://localhost:5173`
- Backend API: `http://localhost:5000/api`

## Main Workflows

### Products and Low Stock

When creating a product:

- `Initial Stock` is the current quantity available.
- `Reorder Point` is the minimum safe quantity.

A product is low stock when:

```text
stockLevel <= reorderPoint
```

Example:

```text
Initial Stock: 60
Reorder Point: 10
Order Qty: 51
Remaining Stock: 9
```

Because `9 <= 10`, the product appears in Low Stock Products.

### Orders and Payments

Wholesale orders deduct stock immediately after creation. The order form calculates item details automatically from the selected product, quantity, and sale price.

Payment behavior:

- `Total Amount` is the full order value.
- `Paid Amount` is the money received.
- `Pending Amount` is `Total Amount - Paid Amount`.
- Dashboard `Total Sales Revenue` uses paid amount only.
- Pending balances appear in the dashboard Pending Payments section with supplier name and order number.

Example:

```text
Total Amount: 5000
Paid Amount: 4800
Pending Amount: 200
Dashboard Revenue: 4800
```

## API Overview

| Method | Endpoint | Description | Access |
| --- | --- | --- | --- |
| POST | `/api/auth/register` | Register user and send OTP | Public |
| POST | `/api/auth/verify-otp` | Verify email OTP | Public |
| POST | `/api/auth/login` | Login and receive token | Public |
| POST | `/api/auth/forgot-password` | Send password reset OTP | Public |
| POST | `/api/auth/reset-password` | Reset password with OTP | Public |
| GET | `/api/auth/me` | Get current user | Authenticated |
| GET | `/api/products` | List products with filters | Authenticated |
| POST | `/api/products` | Create product | Authenticated |
| PUT | `/api/products/:id` | Update product | Authenticated |
| DELETE | `/api/products/:id` | Delete product | Admin |
| GET | `/api/categories` | List categories | Authenticated |
| GET | `/api/suppliers` | List suppliers | Authenticated |
| GET | `/api/orders` | List wholesale orders | Authenticated |
| POST | `/api/orders` | Create wholesale order | Authenticated |
| PUT | `/api/orders/:id` | Update wholesale order | Authenticated |
| PUT | `/api/orders/:id/status` | Update order status | Authenticated |
| DELETE | `/api/orders/:id` | Delete order | Admin |
| GET | `/api/analytics/dashboard-summary` | Dashboard KPIs and payment summary | Authenticated |
| GET | `/api/ai/smart-reorder` | AI reorder recommendations | Authenticated |
| POST | `/api/ai/generate-description` | Generate product description | Authenticated |
| POST | `/api/ai/chat` | Inventory chatbot | Authenticated |
| GET | `/api/activity-logs` | Activity log list | Admin |
| GET | `/api/users` | User management list | Admin |

## Scripts

Backend:

```bash
npm start
```

Frontend:

```bash
npm run dev
npm run lint
npm run build
npm run preview
```

## Deployment Notes

Backend hosting:

1. Deploy the `backend` folder to Render, Railway, or another Node host.
2. Set all `backend/.env` variables in the hosting dashboard.
3. Use `npm install` as the build command.
4. Use `npm start` as the start command.

Frontend hosting:

1. Deploy the `frontend` folder to Vercel, Netlify, or another static host.
2. Set `VITE_API_URL` to your deployed backend URL plus `/api`.
3. Build with `npm run build`.

After deployment, update `FRONTEND_URL` in the backend environment to match the live frontend URL.

## Verification

Useful checks before deploying:

```bash
cd frontend
npm run lint
npm run build

cd ../backend
node --check src/controllers/orderController.js
node --check src/controllers/analyticsController.js
```
