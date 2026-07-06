// ============================================================
// CONFIGURATION
// ============================================================
// The base URL for all our API requests
// Since our HTML is served FROM the same server, we use a relative path
// "/todos" means: whatever domain:port this page is on + /todos
const API_URL = "/todos";

// ============================================================
// DOM ELEMENT REFERENCES
// ============================================================
// We grab references to HTML elements once and reuse them
// document.getElementById() finds an element by its "id" attribute
// Storing them in variables is faster than searching the DOM every time

const todoInput    = document.getElementById("todoInput");    // The text input
const addBtn       = document.getElementById("addBtn");       // The "Add Todo" button
const todoList     = document.getElementById("todoList");     // The list container
const emptyState   = document.getElementById("emptyState");   // "No todos" message
const totalCount   = document.getElementById("totalCount");   // Stats: total
const completedCount = document.getElementById("completedCount"); // Stats: done

// ============================================================
// FETCH ALL TODOS — runs when the page first loads
// ============================================================
// This function talks to GET /todos on our Express server
// and renders each todo onto the page

async function loadTodos() {
  // "async" lets us use "await" inside this function
  try {
    // fetch() sends an HTTP request — like a browser visiting a URL
    // By default, fetch() sends a GET request
    // "await" pauses here until the server sends back a response
    const response = await fetch(API_URL);

    // response.json() reads the response body and parses it from
    // JSON text into a JavaScript array
    // "await" pauses again until the parsing is complete
    const todos = await response.json();

    // Clear the list before re-rendering
    // (so we don't duplicate items on refresh)
    todoList.innerHTML = "";

    // Loop through every todo and create a card for each one
    // forEach runs the callback function once for each item in the array
    todos.forEach((todo) => renderTodo(todo));

    // Update the stats bar
    updateStats(todos);

    // Show or hide the empty state message
    emptyState.style.display = todos.length === 0 ? "block" : "none";

  } catch (error) {
    console.error("Failed to load todos:", error);
  }
}

// ============================================================
// RENDER A SINGLE TODO — creates the HTML for one todo card
// ============================================================
// This function takes a todo object (from MongoDB) and creates
// the HTML elements to display it, then inserts them into todoList

function renderTodo(todo) {
  // Create the outer container div for this todo
  const item = document.createElement("div");
  item.classList.add("todo-item");         // Add the base CSS class
  item.dataset.id = todo._id;              // Store the MongoDB ID on the element

  // If the todo is already completed, add the "completed" CSS class
  // This triggers the strikethrough styling in CSS
  if (todo.completed) {
    item.classList.add("completed");
  }

  // Format the createdAt date into a human-readable string
  // new Date() converts the ISO string from MongoDB into a Date object
  // toLocaleDateString() formats it based on the user's local region
  const dateStr = new Date(todo.createdAt).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
    hour: "2-digit",
    minute: "2-digit",
  });

  // Set the inner HTML of the todo card
  // Template literals (backtick strings) allow us to embed variables with ${...}
  // todo._id is the unique MongoDB ID — used in data attributes and event handlers
  // todo.completed ? "checked" : "" adds the "checked" attribute if done
  item.innerHTML = `
    <div class="todo-top">
      <input
        type="checkbox"
        class="todo-checkbox"
        ${todo.completed ? "checked" : ""}
        title="Mark as complete"
      />
      <span class="todo-text">${escapeHTML(todo.text)}</span>
      <div class="todo-actions">
        <button class="btn btn-edit" title="Edit this todo">Edit</button>
        <button class="btn btn-delete" title="Delete this todo">Delete</button>
      </div>
    </div>
    <div class="todo-date">Created: ${dateStr}</div>
  `;

  // ---- ATTACH EVENT LISTENERS ----

  // Checkbox: toggle completed status when clicked
  const checkbox = item.querySelector(".todo-checkbox");
  checkbox.addEventListener("change", () => toggleComplete(todo._id, checkbox.checked, item));

  // Edit button: switch to inline edit mode
  const editBtn = item.querySelector(".btn-edit");
  editBtn.addEventListener("click", () => startEditing(todo._id, item, todo.text));

  // Delete button: remove the todo
  const deleteBtn = item.querySelector(".btn-delete");
  deleteBtn.addEventListener("click", () => deleteTodo(todo._id, item));

  // Insert the completed todo card into the list
  todoList.appendChild(item);
}

// ============================================================
// ADD A NEW TODO
// ============================================================
async function addTodo() {
  // Get the value from the input box and remove leading/trailing whitespace
  const text = todoInput.value.trim();

  // Don't send an empty string to the server
  if (!text) {
    todoInput.focus();   // Put the cursor back in the input
    return;              // Stop the function early
  }

  try {
    // fetch() with method "POST" and a body sends data TO the server
    const response = await fetch(API_URL, {
      method: "POST",

      // Headers tell the server what format the body is in
      // "Content-Type: application/json" means "I'm sending JSON"
      // Without this, express.json() middleware won't parse the body
      headers: { "Content-Type": "application/json" },

      // JSON.stringify() converts our JavaScript object into a JSON string
      // The server receives this string and parses it back into an object
      body: JSON.stringify({ text }),
    });

    // Check if the server returned an error status (400, 500, etc.)
    if (!response.ok) {
      const err = await response.json();
      alert(err.message || "Failed to add todo");
      return;
    }

    // The server returns the newly saved todo object (with _id, createdAt, etc.)
    const newTodo = await response.json();

    // Clear the input box after successful add
    todoInput.value = "";

    // Render the new todo card at the bottom of the list
    renderTodo(newTodo);

    // Update stats to reflect the new total
    updateStatsFromDOM();

    // Hide the empty state since we now have at least one todo
    emptyState.style.display = "none";

  } catch (error) {
    console.error("Failed to add todo:", error);
  }
}

// ============================================================
// TOGGLE COMPLETE STATUS
// ============================================================
async function toggleComplete(id, isCompleted, itemElement) {
  try {
    // Send a PUT request with the new completed value
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ completed: isCompleted }),
    });

    if (!response.ok) return;

    // Toggle the "completed" CSS class on the card
    // This applies/removes the strikethrough styling
    itemElement.classList.toggle("completed", isCompleted);

    // Update the stats bar
    updateStatsFromDOM();

  } catch (error) {
    console.error("Failed to update todo:", error);
  }
}

// ============================================================
// START INLINE EDITING
// ============================================================
// Replaces the text span with an input field so the user can type a new value

function startEditing(id, itemElement, currentText) {
  // Find the top row and the text span inside this card
  const topRow  = itemElement.querySelector(".todo-top");
  const textSpan = itemElement.querySelector(".todo-text");
  const actions  = itemElement.querySelector(".todo-actions");

  // Create an input field pre-filled with the current text
  const input = document.createElement("input");
  input.type = "text";
  input.value = currentText;
  input.className = "edit-input";

  // Replace the text span with the input field
  topRow.replaceChild(input, textSpan);

  // Replace the Edit/Delete buttons with Save/Cancel buttons
  actions.innerHTML = `
    <button class="btn btn-save">Save</button>
    <button class="btn btn-cancel">Cancel</button>
  `;

  // Focus the input so the user can start typing immediately
  input.focus();
  // Move cursor to end of text
  input.setSelectionRange(input.value.length, input.value.length);

  // Save button: send the new text to the server
  actions.querySelector(".btn-save").addEventListener("click", () => {
    saveEdit(id, itemElement, input.value.trim(), textSpan, actions);
  });

  // Cancel button: put the original text back without saving
  actions.querySelector(".btn-cancel").addEventListener("click", () => {
    topRow.replaceChild(textSpan, input);
    actions.innerHTML = `
      <button class="btn btn-edit">Edit</button>
      <button class="btn btn-delete">Delete</button>
    `;
    // Re-attach event listeners since we recreated the buttons
    actions.querySelector(".btn-edit").addEventListener("click", () =>
      startEditing(id, itemElement, currentText)
    );
    actions.querySelector(".btn-delete").addEventListener("click", () =>
      deleteTodo(id, itemElement)
    );
  });

  // Also save when the user presses Enter
  input.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      saveEdit(id, itemElement, input.value.trim(), textSpan, actions);
    }
    if (e.key === "Escape") {
      // Pressing Escape cancels the edit
      actions.querySelector(".btn-cancel").click();
    }
  });
}

// ============================================================
// SAVE AN EDITED TODO
// ============================================================
async function saveEdit(id, itemElement, newText, textSpan, actions) {
  // Don't save if the text is empty
  if (!newText) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "PUT",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: newText }),
    });

    if (!response.ok) return;

    const updatedTodo = await response.json();

    // Update the text span with the new value
    textSpan.textContent = updatedTodo.text;

    // Get the input element (currently in the DOM) and replace it with the updated span
    const input = itemElement.querySelector(".edit-input");
    const topRow = itemElement.querySelector(".todo-top");
    topRow.replaceChild(textSpan, input);

    // Restore the original Edit/Delete buttons
    actions.innerHTML = `
      <button class="btn btn-edit">Edit</button>
      <button class="btn btn-delete">Delete</button>
    `;
    actions.querySelector(".btn-edit").addEventListener("click", () =>
      startEditing(id, itemElement, updatedTodo.text)
    );
    actions.querySelector(".btn-delete").addEventListener("click", () =>
      deleteTodo(id, itemElement)
    );

  } catch (error) {
    console.error("Failed to save edit:", error);
  }
}

// ============================================================
// DELETE A TODO
// ============================================================
async function deleteTodo(id, itemElement) {
  // Ask for confirmation before deleting
  if (!confirm("Delete this todo?")) return;

  try {
    const response = await fetch(`${API_URL}/${id}`, {
      method: "DELETE",
    });

    if (!response.ok) return;

    // Remove the card from the DOM immediately
    itemElement.remove();

    // Update stats
    updateStatsFromDOM();

    // Show empty state if no todos remain
    if (todoList.children.length === 0) {
      emptyState.style.display = "block";
    }

  } catch (error) {
    console.error("Failed to delete todo:", error);
  }
}

// ============================================================
// STATS HELPERS
// ============================================================

// Used after initial load — receives the full todos array
function updateStats(todos) {
  const done = todos.filter((t) => t.completed).length;
  totalCount.textContent    = `${todos.length} todo${todos.length !== 1 ? "s" : ""}`;
  completedCount.textContent = `${done} completed`;
}

// Used after add/toggle/delete — counts directly from the DOM
function updateStatsFromDOM() {
  const items = todoList.querySelectorAll(".todo-item");
  const done  = todoList.querySelectorAll(".todo-item.completed");
  totalCount.textContent    = `${items.length} todo${items.length !== 1 ? "s" : ""}`;
  completedCount.textContent = `${done.length} completed`;
}

// ============================================================
// SECURITY HELPER — prevent XSS attacks
// ============================================================
// XSS (Cross-Site Scripting) is when malicious HTML/JS is injected
// into a page. If a user types "<script>alert('hacked')</script>"
// as a todo and we render it directly, the browser would execute it.
// escapeHTML() converts dangerous characters into safe HTML entities
// so they display as text, not executable code.

function escapeHTML(str) {
  const map = { "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#039;" };
  return str.replace(/[&<>"']/g, (char) => map[char]);
}

// ============================================================
// EVENT LISTENERS
// ============================================================

// Click the Add button → run addTodo()
addBtn.addEventListener("click", addTodo);

// Press Enter in the input box → run addTodo()
// This is a common UX improvement — users expect Enter to submit
todoInput.addEventListener("keydown", (e) => {
  if (e.key === "Enter") addTodo();
});

// ============================================================
// INITIALIZE — runs immediately when the page loads
// ============================================================
// This calls loadTodos() which fetches all existing todos from the
// server and renders them so the user sees their list right away
loadTodos();
