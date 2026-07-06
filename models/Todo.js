// Import Mongoose
// Mongoose is a library that helps us talk to MongoDB using JavaScript objects
// Instead of writing raw database queries, we define a "schema" (blueprint)
const mongoose = require("mongoose");

// Define the Schema
// A schema is like a blueprint or a form — it tells MongoDB exactly
// what fields a Todo document should have and what type each field is
const todoSchema = new mongoose.Schema(
  {
    // "text" is the actual todo text the user types in
    // String means it must be text (not a number or boolean)
    // required: true means MongoDB will REFUSE to save if text is missing
    // trim: true automatically removes extra spaces from both ends of the text
    text: {
      type: String,
      required: true,
      trim: true,
    },

    // "completed" tracks whether the todo is done or not
    // Boolean means it can only be true or false
    // default: false means every new todo starts as NOT completed
    completed: {
      type: Boolean,
      default: false,
    },
  },

  // This second argument is an "options object"
  // timestamps: true tells Mongoose to AUTOMATICALLY add two fields:
  //   - createdAt: the date/time the todo was first saved
  //   - updatedAt: the date/time the todo was last changed
  // We don't have to write these fields ourselves — Mongoose handles it!
  { timestamps: true }
);

// Create the Model
// A model is a JavaScript class that Mongoose creates from the schema
// "Todo" is the name — Mongoose will automatically create a MongoDB
// collection called "todos" (lowercase + plural)
// mongoose.model("ModelName", schema)
const Todo = mongoose.model("Todo", todoSchema);

// Export the Model
// module.exports makes this available to other files
// Any file that does require("./models/Todo") will get this Todo model
module.exports = Todo;
