// Import the Todo Model
// We need this to interact with the "todos" collection in MongoDB
const Todo = require("../models/Todo");

// ============================================================
// GET ALL TODOS
// Route:   GET /todos
// Purpose: Fetch every todo from MongoDB and send it to the browser
// ============================================================
const getAllTodos = async (req, res) => {
  // "async" means this function contains code that takes time (database calls)
  // Without "async", we can't use "await" inside the function

  try {
    // Todo.find({}) asks MongoDB: "Give me ALL documents in the todos collection"
    // The empty {} means "no filter" — return everything
    // "await" PAUSES this line until MongoDB finishes and returns the data
    // Without "await", todos would be a Promise object, not the actual data
    const todos = await Todo.find({});

    // res.json() converts the JavaScript array into JSON format
    // and sends it back to whoever made the request (the browser)
    // Status 200 means "OK — everything worked fine"
    res.status(200).json(todos);
  } catch (error) {
    // If anything goes wrong (e.g., database is offline),
    // we catch the error here so the server doesn't crash
    // Status 500 means "Internal Server Error — something went wrong on our end"
    res.status(500).json({ message: "Failed to fetch todos", error: error.message });
  }
};

// ============================================================
// CREATE A NEW TODO
// Route:   POST /todos
// Purpose: Take the text from the request body and save a new todo
// ============================================================
const createTodo = async (req, res) => {
  try {
    // req.body contains the data sent FROM the browser
    // For example: { "text": "Buy milk" }
    // We destructure "text" out of that object
    const { text } = req.body;

    // Basic validation — if text is empty or missing, reject the request
    // trim() removes whitespace — prevents saving "   " as a valid todo
    if (!text || text.trim() === "") {
      // Status 400 means "Bad Request — the user sent invalid data"
      return res.status(400).json({ message: "Todo text is required" });
    }

    // Create a new Todo instance using the model
    // This is like filling out the blueprint from Todo.js
    // We only pass "text" — "completed" defaults to false, "createdAt" is automatic
    const newTodo = new Todo({ text });

    // .save() actually writes this new document to MongoDB
    // "await" waits for the save to complete before moving to the next line
    const savedTodo = await newTodo.save();

    // Status 201 means "Created — a new resource was successfully created"
    // We send back the saved todo so the browser can add it to the list
    res.status(201).json(savedTodo);
  } catch (error) {
    res.status(500).json({ message: "Failed to create todo", error: error.message });
  }
};

// ============================================================
// UPDATE A TODO (Edit text OR toggle complete)
// Route:   PUT /todos/:id
// Purpose: Find a todo by its ID and update its fields
// ============================================================
const updateTodo = async (req, res) => {
  try {
    // req.params.id extracts the ID from the URL
    // For example: PUT /todos/64abc123 → req.params.id = "64abc123"
    const { id } = req.params;

    // req.body contains whatever the browser wants to change
    // Could be: { text: "New text" } or { completed: true } or both
    const { text, completed } = req.body;

    // findByIdAndUpdate() does three things in one step:
    //   1. Finds the document with this _id
    //   2. Updates it with the values we provide
    //   3. Returns the updated document
    //
    // $set tells MongoDB to ONLY update the fields we pass
    // Without $set, MongoDB might erase other fields
    //
    // { new: true } means "return the UPDATED document, not the old one"
    // { runValidators: true } means "run the schema rules during update too"
    const updatedTodo = await Todo.findByIdAndUpdate(
      id,
      { $set: { text, completed } },
      { new: true, runValidators: true }
    );

    // If no todo was found with that ID, return a 404 Not Found
    if (!updatedTodo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    // Send back the updated todo
    res.status(200).json(updatedTodo);
  } catch (error) {
    res.status(500).json({ message: "Failed to update todo", error: error.message });
  }
};

// ============================================================
// DELETE A TODO
// Route:   DELETE /todos/:id
// Purpose: Find a todo by its ID and permanently remove it
// ============================================================
const deleteTodo = async (req, res) => {
  try {
    // Get the ID from the URL — same as in updateTodo
    const { id } = req.params;

    // findByIdAndDelete() finds the document with this ID and deletes it
    // Returns the deleted document so we can confirm what was removed
    const deletedTodo = await Todo.findByIdAndDelete(id);

    // If no todo was found with that ID, return 404
    if (!deletedTodo) {
      return res.status(404).json({ message: "Todo not found" });
    }

    // Send a success message confirming deletion
    res.status(200).json({ message: "Todo deleted successfully" });
  } catch (error) {
    res.status(500).json({ message: "Failed to delete todo", error: error.message });
  }
};

// Export all four controller functions
// Routes will import these to connect URLs to the right logic
module.exports = { getAllTodos, createTodo, updateTodo, deleteTodo };
