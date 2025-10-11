/**
 * backend/app.js — SPA-only server (no EJS)
 */
const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const session = require("express-session");
const MySQLStoreFactory = require("express-mysql-session");
const csrf = require("@dr.pogodin/csurf");

// ---- Routers (create these files) ----
// Public API routes like /api/auth/login etc.
const notLoggedInRoutes = require("./api/notLoggedIn");   // e.g., login, signup, etc.
// Protected API routes like /api/loggedin/jobs, /api/loggedin/profile, etc.
const loggedInRoutes = require("./api/loggedin");   // requires session auth

// ---- App/Server/Socket.IO setup ----
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  // In dev (FE on 5173), allow socket connection from Vite origin if you connect directly
  cors: { origin: ["http://localhost:5173"], credentials: true },
});

// ---- Parsers ----
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// ---- Sessions (MySQL store) ----
const MySQLStore = MySQLStoreFactory(session);
const sessionStore = new MySQLStore({
  host: "localhost",
  user: "root",
  password: "Kloc0004",
  database: "tools_for_tasks",
  createDatabaseTable: true,
  clearExpired: true,
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: 7 * 24 * 60 * 60 * 1000,
});

const sessionMiddleware = session({
  secret: process.env.SESSION_SECRET || "change-me",
  resave: false,
  saveUninitialized: false,
  store: sessionStore,
  name: "tft.sid",
  cookie: {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
  },
});
app.use(sessionMiddleware);

// // ---- CSRF (session-based) ----
// const csrfProtection = csrf(); // protects all non-GET requests
// app.use(csrfProtection);



// ---- Mount APIs ----
app.use("/api", notLoggedInRoutes);


app.use("/api/loggedIn", loggedInRoutes);

// ---- Socket.IO shares the session ----
const wrap = (mw) => (socket, next) => mw(socket.request, {}, next);
io.use(wrap(sessionMiddleware));

io.on("connection", (socket) => {
  const sess = socket.request.session;
  if (!sess?.org || !sess?.role) return;

  if (sess.role === "owner") {
    socket.join(`org:${sess.org}`);
    console.log(`Owner ${socket.id} joined room org:${sess.org}`);
  }
  if ((sess.role === "crew" || sess.role === "manager") && sess.loginid) {
    socket.join(`emp:${sess.loginid}`);
    console.log(`Employee ${socket.id} joined room emp:${sess.loginid}`);
  }

  socket.on("disconnect", () => {});
});

// ---- Serve React build (same-server prod) ----
app.use(express.static(path.join(__dirname, "../frontend/dist")));


// ---- Simple error handler ----
app.use((err, _req, res, _next) => {
  console.error(err);
  const status = err.status || 500;
  res.status(status).json({ error: err.message || "Server error" });
});

// ---- Start server ----
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

module.exports = app;
