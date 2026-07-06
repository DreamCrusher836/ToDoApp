# 📝 Todo App — Full Stack Beginner Project

A complete, production-quality Todo App built with **Node.js**, **Express**, **MongoDB Atlas**, and **Vanilla JavaScript**. This project is designed to teach full-stack web development from the ground up.

---

## 🖼️ Screenshots

> Add your screenshots to the `/screenshots` folder and reference them here.

<!-- ![App Screenshot](screenshots/app.png) -->

---

## 📁 Folder Structure

```
todo-app/
│
├── server.js              # Entry point — starts Express and connects MongoDB
├── package.json           # Project metadata and dependencies
├── .env                   # Secret config (MONGO_URI) — never commit this!
├── README.md              # This file
│
├── models/
│   └── Todo.js            # Mongoose schema — blueprint for a Todo document
│
├── routes/
│   └── todoRoutes.js      # URL → controller function mapping
│
├── controllers/
│   └── todoController.js  # Business logic — CRUD operations
│
├── public/
│   ├── index.html         # Frontend HTML structure
│   ├── style.css          # Visual styling
│   └── script.js          # Frontend logic using Fetch API
│
└── screenshots/           # Add app screenshots here
```

---

## ⚙️ Installation

### Step 1 — Clone or download the project

```bash
cd your-projects-folder
```

### Step 2 — Install dependencies

```bash
npm install
```

This installs: `express`, `mongoose`, `dotenv`, `cors`, and `nodemon`.

### Step 3 — Set up your `.env` file

Open `.env` and add your MongoDB Atlas connection string:

```
MONGO_URI=mongodb+srv://your-username:your-password@cluster0.xxxxx.mongodb.net/todoapp?retryWrites=true&w=majority
PORT=3000
```

> Get your connection string from MongoDB Atlas → Clusters → Connect → Connect your application

### Step 4 — Run the app in development mode

```bash
npm run dev
```

You should see:
```
✅ Connected to MongoDB Atlas
🚀 Server is running at http://localhost:3000
```

### Step 5 — Open in browser

Visit: [http://localhost:3000](http://localhost:3000)

---

## 🍃 How MongoDB Works

MongoDB is a **NoSQL database** — instead of tables and rows (like SQL), it stores data as **documents** (similar to JavaScript objects).

- A **Collection** is like a table → our collection is called `todos`
- A **Document** is like a row → each todo is one document
- Documents are stored in **BSON** format (Binary JSON)

Example document in MongoDB:
```json
{
  "_id": "64abc123...",
  "text": "Buy milk",
  "completed": false,
  "createdAt": "2024-01-15T10:30:00.000Z",
  "updatedAt": "2024-01-15T10:30:00.000Z"
}
```

**Mongoose** is the library we use to define the shape of these documents (via a Schema) and interact with them using JavaScript.

---

## ⚡ How Express Works

Express is a **web framework** for Node.js. It handles:

1. **Receiving HTTP requests** (GET, POST, PUT, DELETE)
2. **Running middleware** (cors, json parsing, static files)
3. **Routing** (mapping URLs to controller functions)
4. **Sending responses** back to the browser

Request flow:
```
Browser Request
      ↓
   CORS Middleware      (allows cross-origin requests)
      ↓
   JSON Middleware      (parses req.body)
      ↓
   Static Middleware    (serves HTML/CSS/JS files)
      ↓
   Router (/todos)      (matches URL to handler)
      ↓
   Controller Function  (runs business logic)
      ↓
   MongoDB              (read or write data)
      ↓
   res.json()           (sends JSON response back)
      ↓
Browser Receives Data
```

---

## 🔌 API Endpoints

| Method | Endpoint | Description | Request Body | Response |
|--------|----------|-------------|--------------|----------|
| GET | `/todos` | Fetch all todos | None | Array of todo objects |
| POST | `/todos` | Create a new todo | `{ "text": "Buy milk" }` | The new todo object |
| PUT | `/todos/:id` | Update text or completed status | `{ "text": "New text" }` or `{ "completed": true }` | Updated todo object |
| DELETE | `/todos/:id` | Delete a todo permanently | None | `{ "message": "Todo deleted successfully" }` |

### Example Requests

**Create a todo:**
```http
POST /todos
Content-Type: application/json

{ "text": "Buy groceries" }
```

**Mark as complete:**
```http
PUT /todos/64abc123
Content-Type: application/json

{ "completed": true }
```

**Delete a todo:**
```http
DELETE /todos/64abc123
```

---

## 🧪 How to Test

### 1. Browser
- Open [http://localhost:3000](http://localhost:3000)
- Add, edit, delete, and complete todos

### 2. Network Tab (Chrome DevTools)
- Press `F12` → click **Network** tab
- Add a todo — you'll see a `POST /todos` request appear
- Click the request to see the request body and response

### 3. MongoDB Atlas
- Log in at [cloud.mongodb.com](https://cloud.mongodb.com)
- Navigate to: Clusters → Browse Collections → todoapp → todos
- You'll see your todos saved as documents in real time

### 4. Terminal Logs
- Your terminal shows all server activity
- Mongoose logs the queries it runs (visible in dev mode)

---

## 🚀 Future Improvements

- [ ] User authentication (login/register)
- [ ] Todo categories / tags
- [ ] Due dates and reminders
- [ ] Drag-and-drop reordering
- [ ] Search and filter todos
- [ ] Dark mode toggle
- [ ] Deploy to Render / Railway (free hosting)
- [ ] Mobile app with React Native

---

## 📦 Dependencies

| Package | Purpose |
|---------|---------|
| `express` | Web server framework |
| `mongoose` | MongoDB object modeling |
| `dotenv` | Load environment variables from `.env` |
| `cors` | Enable cross-origin requests |
| `nodemon` | Auto-restart server on file changes (dev only) |

---

## 👤 Author

Built as a learning project to understand full-stack web development with Node.js and MongoDB.
