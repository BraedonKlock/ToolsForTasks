# CLAUDE.md - Tools for Tasks

## Project Overview

Tools for Tasks is a full-stack web application that helps employers track tools, materials, and employees for job assignments. Employees can sign in and check off tools/materials as they load trucks before departing for jobs.

**Status:** Work in progress - not all features are fully implemented yet.

## Tech Stack

- **Frontend:** React 19 + Vite
- **Backend:** Node.js + Express 5 + Socket.io
- **Database:** MySQL (mysql2 with promise wrapper)
- **Authentication:** JWT (Bearer tokens)
- **Testing:** Cypress (E2E), Jest (backend)

## Project Structure

```
/ToolsForTasks
├── /backend
│   ├── app.js              # Server entry (Express + Socket.io)
│   ├── /api                # Route definitions
│   │   ├── loggedin.js     # Protected routes (require JWT)
│   │   └── notLoggedIn.js  # Public routes (login, signup)
│   ├── /controllers        # Request handlers
│   ├── /models             # Database models/queries
│   ├── /middleware         # Auth helpers
│   ├── /util               # Database connection
│   └── /_tests_            # Jest tests
├── /frontend
│   ├── /src
│   │   ├── /components     # Reusable UI components
│   │   ├── /pages          # Full page components
│   │   ├── /context        # React Context (AuthContext)
│   │   ├── /routes         # Route protection components
│   │   ├── /styles         # CSS files (per-component)
│   │   └── App.jsx         # Main routes
│   └── /cypress            # E2E tests
```

## Running the Project

```bash
# Backend (port 3000)
cd backend
npm install
npm start          # Uses nodemon for dev
npm run start-server  # Production (no nodemon)

# Frontend (port 5173)
cd frontend
npm install
npm run dev

# Tests
cd frontend && npm run cy:open   # Cypress interactive
cd backend && npm test           # Jest
```

## Environment Variables

Backend `.env`:
```
DB_HOST=localhost
DB_PORT=3306
DB_USER=<username>
DB_PASS=<password>
DB_NAME=<database>
JWT_ACCESS_SECRET=<secret>
NODE_ENV=development
PORT=3000
```

## Coding Conventions

### Naming

| Element | Convention | Example |
|---------|------------|---------|
| React components | PascalCase | `JobCard.jsx`, `LoginPage.jsx` |
| Page files | camelCase or PascalCase | `addJobPage.jsx`, `JobsPage.jsx` |
| Backend files | camelCase | `loggedin.js`, `notLoggedIn.js` |
| Model classes | PascalCase | `class Jobs`, `class Employee` |
| Functions/methods | camelCase | `getAllJobs()`, `handleDelete()` |
| CSS files | Match component name | `JobsPage.css`, `LoginPage.css` |
| Database columns | snake_case | `org_id`, `job_id`, `created_at` |

### Module Systems

- **Backend:** CommonJS (`require()`, `module.exports`)
- **Frontend:** ES6 Modules (`import`, `export`)

### Formatting

- 2-space indentation
- Semicolons required
- Single quotes in backend, double quotes acceptable in frontend

## React Patterns

### Components

- **Functional components only** - no class components
- Use hooks for all state and side effects

### State Management

```jsx
// Local state
const [jobs, setJobs] = useState([]);
const [error, setError] = useState("");

// Global auth from context
const { accessToken, user, logout } = useContext(AuthContext);
```

### Data Fetching Pattern

```jsx
const loadJobs = useCallback(async () => {
  try {
    const res = await fetch("/api/loggedIn/jobs", {
      headers: { Authorization: `Bearer ${accessToken}` }
    });
    if (res.status === 401) return logout();
    const data = await res.json();
    if (data.ok) setJobs(data.jobs);
  } catch (err) {
    setError("Failed to load jobs");
  }
}, [accessToken, logout]);

useEffect(() => {
  if (!accessToken) return;
  loadJobs();
}, [accessToken, loadJobs]);
```

### Socket.io Frontend Pattern

```jsx
useEffect(() => {
  const s = io(`http://${window.location.hostname}:3000`, {
    auth: { token: accessToken }
  });
  setSocket(s);
  return () => s.disconnect();
}, [accessToken]);

useEffect(() => {
  if (!socket) return;
  const handler = () => loadJobs();
  socket.on("jobs:changed", handler);
  return () => socket.off("jobs:changed", handler);
}, [socket, loadJobs]);
```

### Error Display

```jsx
{error && <p className="error">{error}</p>}
```

## Backend Patterns

### Route Structure

- Public routes: `/api` (login, signup)
- Protected routes: `/api/loggedIn` (require JWT)

### Controller Pattern

```javascript
exports.getAllJobs = async (req, res) => {
  // 1. Auth check
  if (!req.user) return res.status(401).json({ error: "Unauthenticated" });

  // 2. Role check (if needed)
  const role = (req.user.role || "").trim().toLowerCase();
  if (role !== "owner" && role !== "manager") {
    return res.status(403).json({ error: "Do not have permission." });
  }

  // 3. Process request
  try {
    const [jobs] = await Jobs.getAllJobs(req.user.orgId);
    return res.status(200).json({ ok: true, jobs });
  } catch (err) {
    return res.status(500).json({ error: "Server error" });
  }
};
```

### Socket.io Emission (after mutations)

```javascript
const io = req.app.get("io");
io.to(`org:${req.user.orgId}`).emit("jobs:changed");
```

### Response Formats

```javascript
// Success
res.status(200).json({ ok: true, jobs: [...] });
res.status(201).json({ ok: true });

// Error
res.status(400).json({ error: "Validation message" });
res.status(401).json({ error: "Unauthenticated" });
res.status(403).json({ error: "Do not have permission." });
```

## Database Patterns

### Model Structure

```javascript
class Jobs {
  constructor(jobID, title, date, address, phoneNumber, notes, org_id) {
    this.jobID = jobID;
    // ...
  }

  // Instance method for INSERT
  async addJob() {
    return db.execute(
      'INSERT INTO jobs (...) VALUES (?, ?, ?, ?, ?, ?, ?)',
      [this.jobID, this.title, ...]
    );
  }

  // Static method for SELECT
  static getAllJobs(org_id) {
    return db.execute('SELECT * FROM jobs WHERE org_id = ?', [org_id]);
  }
}
```

### Transaction Pattern

```javascript
const conn = await db.getConnection();
try {
  await conn.beginTransaction();
  await conn.execute(...);
  await conn.execute(...);
  await conn.commit();
} catch (err) {
  await conn.rollback();
  throw err;
} finally {
  conn.release();
}
```

### Bulk Insert Pattern

```javascript
const values = employeeDbIds.map(eid => [jobDbId, Number(eid)]);
const placeholders = values.map(() => '(?, ?)').join(', ');
const flatValues = values.flat();
return db.execute(`INSERT INTO job_employees (...) VALUES ${placeholders}`, flatValues);
```

## REST API Design

### Endpoints Pattern

| Method | Path | Description |
|--------|------|-------------|
| GET | `/api/loggedIn/jobs` | List all jobs |
| GET | `/api/loggedIn/jobs/:id` | Get single job |
| POST | `/api/loggedIn/jobs` | Create job |
| PATCH | `/api/loggedIn/jobs/:id` | Update job |
| DELETE | `/api/loggedIn/jobs/:id` | Delete job |
| GET | `/api/loggedIn/jobs/:id/employees` | Get job's employees |
| POST | `/api/loggedIn/jobs/:id/employees` | Assign employees to job |

### Request Format

```javascript
fetch("/api/loggedIn/jobs", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    Authorization: `Bearer ${accessToken}`
  },
  body: JSON.stringify({ jobid, title, date, address, phoneNumber, notes })
});
```

## Authentication Flow

1. User logs in via `/api/login`
2. Backend returns JWT access token
3. Frontend stores token in `sessionStorage` (key: `tft_token`)
4. All protected requests include `Authorization: Bearer <token>`
5. Socket.io connects with `auth: { token }`
6. Backend validates JWT in middleware, attaches `req.user`

### User Roles

- `owner` - Full access to all features
- `manager` - Can manage jobs, employees, tools
- `crew` - Can view assigned jobs and check off items

## Socket.io Events

| Event | Direction | Description |
|-------|-----------|-------------|
| `jobs:changed` | Server → Client | Job was created/updated/deleted |
| `tools:changed` | Server → Client | Tool was created/updated/deleted |
| `toolKits:changed` | Server → Client | Toolkit was modified |

### Room Structure

- `org:${orgId}` - All users in organization
- `owner:${userId}` - Owner-specific notifications
- `emp:${userId}` - Employee-specific notifications

## Testing

### Cypress E2E Tests

```javascript
describe("Jobs Page", () => {
  it("displays jobs list", () => {
    cy.viewport("iphone-x");
    cy.visit("/login");
    // Login flow
    cy.get('input[name="email"]').type("user@email.com");
    cy.get('input[name="password"]').type("password");
    cy.get('button[type="submit"]').click();
    // Assertions
    cy.url().should("include", "/loggedIn");
  });
});
```

### Test Commands

```bash
cd frontend
npm run cy:open   # Interactive mode
npm run cy:run    # Headless mode
```

## Key Files Reference

| File | Purpose |
|------|---------|
| `backend/app.js` | Server setup, middleware, Socket.io config |
| `backend/api/loggedin.js` | Protected route definitions |
| `backend/controllers/loggedinController.js` | Main request handlers |
| `backend/models/*.js` | Database query methods |
| `frontend/src/context/AuthContext.jsx` | Global auth state |
| `frontend/src/App.jsx` | Route definitions |
| `frontend/src/pages/*.jsx` | Page components |

## Common Tasks

### Adding a New API Endpoint

1. Add route in `backend/api/loggedin.js`
2. Add handler in `backend/controllers/loggedinController.js`
3. Add model method in appropriate `backend/models/*.js` file
4. Emit Socket.io event if needed: `io.to(\`org:${orgId}\`).emit("entity:changed")`

### Adding a New Page

1. Create component in `frontend/src/pages/NewPage.jsx`
2. Create styles in `frontend/src/styles/NewPage.css`
3. Add route in `frontend/src/App.jsx`
4. Protect route with `ProtectedRoute` component if needed

### Adding a New Reusable Component

1. Create in `frontend/src/components/ComponentName.jsx`
2. Create styles in `frontend/src/styles/ComponentName.css`

## Notes

- Always use parameterized queries (never concatenate SQL strings)
- Handle 401 responses by logging out user
- Emit Socket.io events after successful mutations
- Use `useCallback` for async functions used in `useEffect` dependencies
- Mobile-first design - test with iPhone-X viewport in Cypress
