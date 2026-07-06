// Import Express
// We need express specifically for its Router feature
const express = require("express");

// Create a Router instance
// express.Router() creates a "mini-app" that handles just the routing
// Think of it as a table of contents: "When this URL is hit, run this function"
// Using a Router keeps our server.js clean — we don't define routes there
const router = express.Router();

// Import Controller Functions
// These are the 4 functions we wrote in todoController.js
// Destructuring lets us pull out exactly what we need from the exported object
const {
  getAllTodos,
  createTodo,
  updateTodo,
  deleteTodo,
} = require("../controllers/todoController");

// ============================================================
// ROUTE DEFINITIONS
// ============================================================
// Each line below says:
//   "When a request comes in with this HTTP method + URL, run this function"
//
// Note: The base path (/todos) is defined in server.js when we mount this router
// So here we use "/" which means "the base path itself"
// And "/:id" means "the base path + a dynamic ID value"
// ============================================================

// GET /todos
// Retrieve all todos from the database
// No ID needed — we want everything
router.get("/", getAllTodos);

// POST /todos
// Create a brand new todo
// The new todo's data comes in req.body (from the browser's fetch call)
router.post("/", createTodo);

// PUT /todos/:id
// Update an existing todo — either its text or its completed status
// :id is a URL parameter — it will be available as req.params.id in the controller
router.put("/:id", updateTodo);

// DELETE /todos/:id
// Permanently remove a todo from the database
// :id tells us WHICH todo to delete
router.delete("/:id", deleteTodo);

// Export the router
// server.js will import this and "mount" it at the /todos path
module.exports = router;
