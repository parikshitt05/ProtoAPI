# ProtoAPI

> Instant mock backends for frontend prototyping — no server setup required.

ProtoAPI is a full-stack SaaS developer tool that lets frontend engineers spin up a fully functional CRUD backend in under 2 minutes. Define a schema, seed fake data, and get live REST endpoints instantly.

---

## Live Demo

|                  | URL                                          |
| ---------------- | -------------------------------------------- |
| **Frontend**     | https://proto-api-omega.vercel.app           |
| **Backend API**  | https://protoapi-backend.onrender.com        |
| **Health Check** | https://protoapi-backend.onrender.com/health |

---

## Features

- **Instant CRUD endpoints** — every resource gets `GET`, `POST`, `PUT`, `PATCH`, `DELETE` auto-generated
- **Schema builder** — define field names and types (string, email, number, boolean, date, image_url, uuid, and more)
- **Auto seeding** — generate up to 50 fake records instantly using Faker.js
- **Pagination & filtering** — `?page=1&limit=10` and `?field=value` query params work out of the box
- **Project workspaces** — organize resources under projects, each with a unique base URL slug
- **JWT authentication** — secure dashboard with register/login, tokens expire in 7 days
- **Rate limiting** — mock endpoints are rate-limited to 100 requests/minute per IP
- **Plan limits** — free tier supports up to 3 projects

---

## Tech Stack

| Layer            | Technology                                                    |
| ---------------- | ------------------------------------------------------------- |
| Frontend         | React 18, Vite, Tailwind CSS                                  |
| Backend          | Node.js, Express                                              |
| Database         | MongoDB, Mongoose                                             |
| Auth             | JWT (jsonwebtoken), bcryptjs                                  |
| Validation       | Zod (backend), React Hook Form + Zod (frontend)               |
| Fake data        | Faker.js                                                      |
| State management | Zustand                                                       |
| HTTP client      | Axios                                                         |
| Deployment       | Vercel (frontend), Render (backend), MongoDB Atlas (database) |

---

## Project Structure

```
protoapi/
├── backend/
│   └── src/
│       ├── config/
│       │   └── db.js
│       ├── middleware/
│       │   ├── auth.js
│       │   ├── rateLimiter.js
│       │   └── validate.js
│       ├── models/
│       │   ├── User.js
│       │   ├── Project.js
│       │   ├── Resource.js
│       │   └── Record.js
│       ├── routes/
│       │   ├── auth.js
│       │   ├── projects.js
│       │   ├── resources.js
│       │   └── mock.js
│       ├── utils/
│       │   └── mockGenerator.js
│       ├── validators/
│       │   └── schemas.js
│       └── server.js
└── frontend/
    └── src/
        ├── api/
        │   └── client.js
        ├── components/
        │   ├── AppLayout.jsx
        │   └── SchemaBuilder.jsx
        ├── pages/
        │   ├── Login.jsx
        │   ├── Register.jsx
        │   ├── Dashboard.jsx
        │   └── ProjectDetail.jsx
        ├── store/
        │   └── useAuthStore.js
        ├── validators/
        │   └── schemas.js
        └── App.jsx
```

---

## Getting Started (Local Development)

### Prerequisites

- Node.js >= 18
- MongoDB running locally (`mongod`)
- Git

### 1. Clone the repository

```bash
git clone https://github.com/parikshitt05/ProtoAPI.git
cd ProtoAPI
```

### 2. Set up the backend

```bash
cd backend
npm install
```

Create `backend/.env`:

```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/mockapidb
JWT_SECRET=your_secret_key_here
CLIENT_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev
```

You should see:

```
Server running on port 5000
MongoDB connected: localhost
```

### 3. Set up the frontend

```bash
cd frontend
npm install
```

Create `frontend/.env`:

```env
VITE_API_URL=http://localhost:5000/api
VITE_MOCK_BASE_URL=http://localhost:5000
```

Start the frontend:

```bash
npm run dev
```

Open `http://localhost:5173` in your browser.

---

## API Reference

### Authentication

| Method | Endpoint             | Description                       |
| ------ | -------------------- | --------------------------------- |
| `POST` | `/api/auth/register` | Create a new account              |
| `POST` | `/api/auth/login`    | Sign in and receive JWT           |
| `GET`  | `/api/auth/me`       | Get current user (requires token) |

### Projects

All routes require `Authorization: Bearer <token>` header.

| Method   | Endpoint              | Description                                        |
| -------- | --------------------- | -------------------------------------------------- |
| `GET`    | `/api/projects`       | List all projects                                  |
| `POST`   | `/api/projects`       | Create a new project                               |
| `GET`    | `/api/projects/:slug` | Get project + its resources                        |
| `DELETE` | `/api/projects/:id`   | Delete project (cascades to resources and records) |

### Resources

| Method   | Endpoint             | Description                         |
| -------- | -------------------- | ----------------------------------- |
| `POST`   | `/api/resources`     | Create resource + seed fake records |
| `DELETE` | `/api/resources/:id` | Delete resource and all its records |

### Mock Endpoints (Public)

These are the live endpoints your frontend prototype calls. No auth required.

```
GET    /mock/:slug/:resource           List records (paginated)
GET    /mock/:slug/:resource/:id       Get single record
POST   /mock/:slug/:resource           Create record (body or auto-generate)
PUT    /mock/:slug/:resource/:id       Replace record
PATCH  /mock/:slug/:resource/:id       Partial update
DELETE /mock/:slug/:resource/:id       Delete record
```

#### Query parameters (GET list)

| Param     | Example           | Description                              |
| --------- | ----------------- | ---------------------------------------- |
| `page`    | `?page=2`         | Page number (default: 1)                 |
| `limit`   | `?limit=20`       | Records per page (default: 10, max: 100) |
| `<field>` | `?company=Google` | Filter by any data field                 |

#### Example

```bash
# List users with pagination
GET https://protoapi-backend.onrender.com/mock/abc123/users?page=1&limit=5

# Get single user by id
GET https://protoapi-backend.onrender.com/mock/abc123/users/64f3abc...

# Create a user (auto-generates from schema if body is empty)
POST https://protoapi-backend.onrender.com/mock/abc123/users
Content-Type: application/json
{}

# Update a field
PATCH https://protoapi-backend.onrender.com/mock/abc123/users/64f3abc...
Content-Type: application/json
{ "name": "Parikshit" }

# Delete
DELETE https://protoapi-backend.onrender.com/mock/abc123/users/64f3abc...
```

---

## Schema Field Types

When building a resource schema, these field types are available:

| Type        | Generated value example         |
| ----------- | ------------------------------- |
| `string`    | `"lorem"`                       |
| `name`      | `"John Smith"`                  |
| `email`     | `"john@example.com"`            |
| `number`    | `482`                           |
| `boolean`   | `true`                          |
| `date`      | `"2024-11-03T10:22:00.000Z"`    |
| `image_url` | `"https://loremflickr.com/..."` |
| `uuid`      | `"a1b2c3d4-..."`                |
| `phone`     | `"+1-555-867-5309"`             |
| `address`   | `"123 Main St"`                 |
| `company`   | `"Acme Corp"`                   |
| `url`       | `"https://example.com"`         |
| `username`  | `"cool_dev42"`                  |
| `color`     | `"purple"`                      |

---

## Deployment

### Backend — Render

| Setting        | Value                |
| -------------- | -------------------- |
| Root Directory | `backend`            |
| Build Command  | `npm install`        |
| Start Command  | `node src/server.js` |
| Node Version   | `>= 18`              |

Environment variables to set on Render:

```
NODE_ENV=production
MONGO_URI=<your Atlas connection string>
JWT_SECRET=<your secret>
CLIENT_URL=<your Vercel frontend URL>
PORT=5000
```

### Frontend — Vercel

| Setting          | Value           |
| ---------------- | --------------- |
| Root Directory   | `frontend`      |
| Build Command    | `npm run build` |
| Output Directory | `dist`          |

Environment variables to set on Vercel:

```
VITE_API_URL=https://protoapi-backend.onrender.com/api
VITE_MOCK_BASE_URL=https://protoapi-backend.onrender.com
```

---

## Contributing

```bash
# Create a feature branch
git checkout -b feat/your-feature

# Make changes, then commit
git add .
git commit -m "feat: describe your change"

# Push and open a PR
git push origin feat/your-feature
```

---

## License

MIT — free to use, modify, and distribute.

---

Built by [Parikshit Tamhane](https://github.com/parikshitt05) — [LinkedIn](https://www.linkedin.com/in/parikshit-tamhane-link/)
