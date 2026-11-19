# Secure Note-Taking & RBAC Platform (Technical Interview Task)

A robust full-stack application built as per technical interview requirements, featuring a secure REST API with MongoDB/Mongoose, JWT authentication, Role-Based Access Control (RBAC), advanced database indexing, MongoDB Aggregation Pipelines, and a functional Next.js frontend integrated via Axios.

---

## 🚀 Features & Core Objectives

1. **Secure Authentication & RBAC**:
   - Secure password hashing using `bcrypt`.
   - JWT (JSON Web Tokens) for authentication.
   - **User Role**: Create, update, delete, and view a list of their own notes.
   - **Admin Role**: Inherits all User capabilities, manages users (add, remove, update, list all users), and views everyone's notes.

2. **Database Indexing & Optimization**:
   - Strict adherence to creating only necessary indexes using `schema.index`.
   - Pagination implemented on all list operations (notes and users).
   - Read and list operations optimized with proper index definitions.

3. **MongoDB Aggregation Pipelines**:
   - **Scenario 1 (Group by Interests):** Uses exactly one `collection.aggregate()` call to group users by their interests list.
   - **Scenario 2 (User Posts `$lookup`):** Single aggregation pipeline using `$lookup` to retrieve all posts belonging to a particular user.

4. **Frontend Integration**:
   - Next.js frontend connected via an Axios client (`client/lib/axios.ts`) with automatic bearer token injection via interceptors.

---

## 🛠️ Tech Stack

- **Backend**: Node.js, Express, Mongoose, JWT, Bcrypt, Dotenv, Cors
- **Frontend**: Next.js, React, Tailwind CSS, Axios
- **Database**: MongoDB

---

## 📁 Project Structure

```text
note-app/
├── server/
│   ├── config/
│   │   └── db.js
│   ├── controllers/
│   │   ├── adminController.js
│   │   ├── aggregationController.js
│   │   ├── authController.js
│   │   └── noteController.js
│   ├── middleware/
│   │   └── auth.js
│   ├── models/
│   │   ├── Note.js
│   │   ├── Post.js
│   │   └── User.js
│   ├── routes/
│   │   ├── adminRoutes.js
│   │   ├── aggregationRoutes.js
│   │   ├── authRoutes.js
│   │   └── noteRoutes.js
│   ├── .env
│   ├── index.js
│   └── package.json
├── client/
│   ├── app/
│   │   └── page.tsx
│   ├── lib/
│   │   └── axios.ts
│   └── package.json
└── README.md
```

---

## ⚙️ Setup & Installation Instructions

### Prerequisites
- Node.js installed
- MongoDB running locally (`mongodb://localhost:27017`) or connection string in `.env`

### 1. Backend Setup
```bash
cd server
npm install
npm run dev
```
*The server will run on `http://localhost:5000`.*

### 2. Frontend Setup
```bash
cd client
npm install
npm run dev
```
*The frontend will run on `http://localhost:3000`.*

---

## 🔌 API Endpoints Summary

### Auth (`/api/auth`)
- `POST /api/auth/register` - Register a new user
- `POST /api/auth/login` - Login user & get JWT token

### Notes (`/api/notes`) - Requires Auth
- `POST /api/notes` - Create a note
- `GET /api/notes` - Get paginated list of user's notes (`?page=1&limit=10`)
- `GET /api/notes/:id` - Get a specific note
- `PUT /api/notes/:id` - Update a note
- `DELETE /api/notes/:id` - Delete a note

### Admin (`/api/admin`) - Requires Admin Role
- `GET /api/admin/users` - List all users (paginated)
- `POST /api/admin/users` - Add a user
- `PUT /api/admin/users/:id` - Update a user
- `DELETE /api/admin/users/:id` - Remove a user & their notes
- `GET /api/admin/notes` - View everyone's notes (paginated)

### Aggregations (`/api/aggregations`)
- `GET /api/aggregations/interests` - Group users by interests (Scenario 1)
- `GET /api/aggregations/user-posts/:userId` - Retrieve user posts via `$lookup` (Scenario 2)
- `POST /api/aggregations/posts` - Create a test post (Requires Auth)
