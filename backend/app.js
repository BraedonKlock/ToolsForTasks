/**
 * backend/app.js — SPA API server with JWT auth (no sessions)
 */

if (process.env.NODE_ENV !== "production") {
  require("dotenv").config(); // load backend/.env in dev
}

const express = require("express");
const http = require("http");
const { Server } = require("socket.io");
const path = require("path");
const cors = require("cors");
const jwt = require("jsonwebtoken");

// ---- Ensure JWT secret is present ----
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
if (!ACCESS_SECRET) {
  throw new Error("Missing JWT_ACCESS_SECRET (set it in backend/.env for dev or env vars in prod)");
}

// ---- Routers ----
// Public API routes: login/signup, etc. (should ISSUE JWTs; no auth required here)
const notLoggedInRoutes = require("./api/notLoggedIn");
// Protected API routes: require a valid JWT
const loggedInRoutes = require("./api/loggedIn");

// ---- App/Server/Socket.IO setup ----
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  // In dev (Vite on 5173), allow socket connection from that origin
  cors: { origin: ["http://localhost:5173"], credentials: false },
});

// ---- Parsers & CORS ----
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

// For local dev, allow the Vite dev server to hit this API.
// In prod, you’ll normally serve the React build from the same origin and can remove/relax this.
app.use(
  cors({
    origin: ["http://localhost:5173"],
    credentials: false, // not using cookies for auth with JWT access tokens
  })
);

// ---- Minimal JWT auth middleware for HTTP ----
function requireAuth(req, res, next) {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });
  try {
    req.user = jwt.verify(token, ACCESS_SECRET, { algorithms: ["HS256"] });
    next();
  } catch {
    res.status(401).json({ error: "Invalid or expired token" });
  }
}

// ---- Mount APIs ----
// Public endpoints (e.g., POST /api/login)
app.use("/api", notLoggedInRoutes);

// Protected endpoints (must send Authorization: Bearer <token>)
app.use("/api/loggedIn", requireAuth, loggedInRoutes);

// ---- Socket.IO auth (verify JWT during handshake) ----
io.use((socket, next) => {
  try {
    // Expect the client to pass token in the connection auth payload:
    // io("http://localhost:3000", { auth: { token: accessToken } })
    const token =
      socket.handshake.auth?.token ||
      (socket.handshake.headers.authorization || "").replace(/^Bearer\s+/i, "");

    if (!token) return next(new Error("Missing token"));

    const decoded = jwt.verify(token, ACCESS_SECRET, { algorithms: ["HS256"] });
    socket.user = decoded; // { sub, role, orgId, ... }
    next();
  } catch (err) {
    next(new Error("Invalid or expired token"));
  }
});

io.on("connection", (socket) => {
  const u = socket.user;
  if (!u?.orgId || !u?.role) {
    // not enough info to room users; still connected though
    return;
  }

  // Example: room strategy similar to your old session-based logic
  if (u.role === "owner") {
    socket.join(`org:${u.orgId}`);
    console.log(`Owner ${socket.id} joined room org:${u.orgId}`);
  }

  if ((u.role === "crew" || u.role === "manager") && u.sub) {
    socket.join(`emp:${u.sub}`);
    console.log(`Employee ${socket.id} joined room emp:${u.sub}`);
  }

  socket.on("disconnect", () => {});
});

// ---- Start server ----
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`API listening on http://localhost:${PORT}`);
});
