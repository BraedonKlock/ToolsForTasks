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
const notLoggedInRoutes = require("./api/notLoggedIn");
const loggedInRoutes = require("./api/loggedIn");

// ---- CORS origin configuration ----
// In production, FRONTEND_URL should be set to the deployed frontend URL
// In development, fall back to common local dev URLs
const allowedOrigins = process.env.FRONTEND_URL
  ? [process.env.FRONTEND_URL]
  : ["http://localhost:5173", "http://localhost:3000", "http://127.0.0.1:5173"];

// ---- App/Server/Socket.IO setup ----
const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: {
    origin: allowedOrigins,
    credentials: true,
  },
  transports: ["websocket", "polling"],
});

// storing io on the app object so controllers can emit socket events
app.set("io", io);

// ---- Parsers & CORS ----
app.use(express.urlencoded({ extended: false }));
app.use(express.json());

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

// ---- Serve uploaded files statically ----
console.log("STATIC UPLOADS PATH:", path.join(__dirname, "uploads"));
app.use('/uploads', express.static(path.join(__dirname, 'uploads')));

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
// Public endpoints
app.use("/api", notLoggedInRoutes);

// Protected endpoints
app.use("/api/loggedIn", requireAuth, loggedInRoutes);

// ---- Socket.IO auth ----
io.use((socket, next) => {
  try {
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
    return;
  }

  // everyone joins their org room so org-wide changes can be broadcast
  const orgRoom = `org:${u.orgId}`;
  socket.join(orgRoom);
  console.log(`${u.role} ${socket.id} joined room ${orgRoom}`);

  // owner personal room (if needed later)
  if (u.role === "owner" && u.sub) {
    socket.join(`owner:${u.sub}`);
    console.log(`Owner ${socket.id} joined room owner:${u.sub}`);
  }

  // employee personal room (if needed later)
  if ((u.role === "crew" || u.role === "manager") && u.sub) {
    socket.join(`emp:${u.sub}`);
    console.log(`Employee ${socket.id} joined room emp:${u.sub}`);
  }

  socket.on("disconnect", () => {});
});

// ---- Start server ----
const PORT = process.env.PORT || 3000;
server.listen(PORT, () => {
  console.log(`API listening on ${PORT}`);
});
