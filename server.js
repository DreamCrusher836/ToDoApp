// ============================================================
// LOAD ENVIRONMENT VARIABLES
// ============================================================
// dotenv reads the .env file and makes its values available
// on the global process.env object
// This MUST be the very first line — before anything else imports process.env
// If you call this after other imports, those imports won't see the env variables
//
// On Vercel, there is no .env file (it's excluded from deployments on purpose,
// since it usually contains secrets) — Vercel injects the variables you set in
// the dashboard directly into process.env instead. dotenv.config() will just
// find nothing to load in that case, which is expected and harmless: it does
// NOT overwrite variables that are already set in process.env.
require("dotenv").config();

// ============================================================
// IMPORTS
// ============================================================

// Import Express
// Express is a framework that makes building web servers in Node.js much easier
// Without Express, you'd have to handle every HTTP request manually with raw Node.js
const express = require("express");

// Import CORS
// CORS = Cross-Origin Resource Sharing
// Browsers block requests from one domain (e.g., localhost:5500) to another (localhost:3000)
// The cors middleware tells the browser: "This server is OK with receiving requests from other origins"
const cors = require("cors");

// Import Mongoose
// Mongoose is our bridge between Node.js and MongoDB
// It handles the connection and lets us use schemas and models
const mongoose = require("mongoose");

// Import our Todo Routes
// This is the router we defined in routes/todoRoutes.js
const todoRoutes = require("./routes/todoRoutes");

// ============================================================
// CREATE THE EXPRESS APP
// ============================================================
// express() creates the main application object
// We call it "app" by convention
// "app" is what we use to configure the server, add middleware, and define routes
const app = express();

// ============================================================
// DEFINE THE PORT
// ============================================================
// process.env.PORT checks if a PORT variable exists
// If not found, we default to 3000
// Using an environment variable for PORT is best practice for deployment
// (Vercel/Heroku/Render set their own PORT value; Vercel actually ignores this
// entirely for serverless functions, but it's harmless to keep for local dev)
const PORT = process.env.PORT || 3000;

// ============================================================
// MIDDLEWARE
// ============================================================
// Middleware = functions that run between receiving a request and sending a response
// Think of middleware as a pipeline — every request flows through these in order
// app.use() registers a middleware to run on EVERY incoming request

// CORS Middleware
// Allows requests from any origin (browsers from different ports/domains)
// Place this BEFORE your routes, otherwise the browser will block requests
// before they ever reach your routes
app.use(cors());

// JSON Middleware
// express.json() reads the raw request body and converts it from JSON text
// into a JavaScript object available as req.body
// Without this middleware, req.body would be undefined
// Example: A browser sends '{"text":"Buy milk"}' — this converts it to { text: "Buy milk" }
app.use(express.json());

// Static Files Middleware
// express.static("public") tells Express:
// "Serve any files inside the /public folder as static files"
// When someone visits http://localhost:3000, they get public/index.html
// When the browser requests style.css, it gets public/style.css automatically
// This is how our HTML/CSS/JS frontend is delivered to the browser
app.use(express.static("public"));

// ============================================================
// ROUTES
// ============================================================
// app.use("/todos", todoRoutes) mounts the router at the /todos path
// This means:
//   - router.get("/")       becomes GET  /todos
//   - router.post("/")      becomes POST /todos
//   - router.put("/:id")    becomes PUT  /todos/:id
//   - router.delete("/:id") becomes DELETE /todos/:id
app.use("/todos", todoRoutes);

// ============================================================
// CONNECT TO MONGODB
// ============================================================
// mongoose.connect() takes the connection string from our environment variables
// It returns a Promise — something that will either succeed or fail

// Fail loudly and immediately if MONGO_URI is missing, instead of letting
// mongoose throw the much less obvious "uri must be a string, got undefined"
// error. This is almost always caused by:
//   - the env var not being set in your hosting provider's dashboard
//   - the env var being set for the wrong environment scope (e.g. only
//     "Preview" when you're testing a "Production" deployment)
//   - a typo in the variable name (MONGO_URI vs MONGODB_URI, etc.)
if (!process.env.MONGO_URI) {
  console.error(
    "❌ MONGO_URI is undefined. Check that it is set in your environment " +
      "(.env locally, or your hosting provider's environment variables " +
      "dashboard for the correct environment scope — Production/Preview/Development)."
  );
  process.exit(1);
}

mongoose
  .connect(process.env.MONGO_URI)
  .then(() => {
    console.log("✅ Connected to MongoDB Atlas");
  })
  .catch((error) => {
    // Common reasons: wrong MONGO_URI, network issue, IP not whitelisted in Atlas
    console.error("❌ Failed to connect to MongoDB:", error.message);
  });

// ============================================================
// START THE SERVER / EXPORT THE APP
// ============================================================
// Vercel's serverless model does not run a long-lived server process —
// it imports this file and calls the exported Express app as a request
// handler for each incoming request. app.listen() is meaningless there
// (it would try to bind a port that nothing connects to).
//
// So: only call app.listen() when we're NOT running on Vercel. Vercel sets
// the VERCEL env var automatically on every deployment, so we can use that
// to tell the two environments apart.
if (!process.env.VERCEL) {
  app.listen(PORT, () => {
    console.log(`🚀 Server is running at http://localhost:${PORT}`);
  });
}

module.exports = app;
