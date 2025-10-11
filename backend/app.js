// backend/app.js
const express = require("express");
const session = require("express-session");
// If you already use MySQL session store, uncomment the next 2 lines:
// const MySQLStore = require("express-mysql-session")(session);
// const store = new MySQLStore({ host: "localhost", user: "root", password: "Kloc0004", database: "tools_for_tasks" });

// Routers (you’ll create these two files)
//   - routes/notLoggedIn.js  (public endpoints like /login, /signup, etc.)
//   - routes/loggedIn.js     (protected endpoints that require auth)
const notLoggedInRoutes = require("./routes/notLoggedIn");
const loggedInRoutes = require("./routes/loggedin");

const app = express();

/**mysql store object for storing session data */
const store = new MySQLStore({
  host: 'localhost',
  user: 'root',
  password: 'Kloc0004',
  database: 'tools_for_tasks',
  createDatabaseTable: true,
  clearExpired: true,
  checkExpirationInterval: 15 * 60 * 1000,
  expiration: 7 * 24 * 60 * 60 * 1000
});

/* ---------- Core middleware ---------- */
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  session({
    secret: process.env.SESSION_SECRET || "change-me",
    resave: false,
    saveUninitialized: false,
    // store,            // ← uncomment if using MySQLStore above
    name: "tft.sid",
    cookie: {
      httpOnly: true,
      sameSite: "lax",
      secure: process.env.NODE_ENV === "production",
    },
  })
);

/* ---------- Auth gate middleware ---------- */
// Hard gate: only allow through if logged in.
function requireLogin(req, res, next) {
  if (req.session && req.session.isLoggedIn) return next();
  return res.status(401).json({ error: "Unauthorized" });
}

// Soft branch helper (optional): if you later want to redirect or branch,
// you can inspect req.session.isLoggedIn here. For now, we just mount routers.

/* ---------- Route mounting ---------- */
// All protected app routes live under /loggedin and require a valid session.
app.use("/loggedin", requireLogin, loggedInRoutes);

// All public routes (not logged in yet) live under / (root).
app.use("/", notLoggedInRoutes);

/* ---------- Start server ---------- */
const PORT = process.env.PORT || 3000;
app.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});

module.exports = app;
