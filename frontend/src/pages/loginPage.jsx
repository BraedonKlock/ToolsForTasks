// src/pages/LoginPage.jsx
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import "../styles/LoginPage.css";

export default function LoginPage() {
  const [accountType, setAccountType] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [csrfToken, setCsrfToken] = useState("");

  // Grab CSRF token once when the page loads
  useEffect(() => {
    (async () => {
      try {
        const r = await fetch("/api/csrf", { credentials: "include" });
        if (!r.ok) throw new Error("Failed to fetch CSRF token");
        const { csrfToken } = await r.json();
        setCsrfToken(csrfToken);
      } catch (e) {
        console.error(e);
        setError("Security token error. Please refresh and try again.");
      }
    })();
  }, []);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/auth/login", {
        method: "POST",
        credentials: "include",
        headers: {
          "Content-Type": "application/json",
          // send the CSRF token in a header (accepted by csurf/csurf-compatible libs)
          "CSRF-Token": csrfToken
          // You could also use "X-CSRF-Token" or include `_csrf` in JSON body if you prefer.
        },
        body: JSON.stringify({ accountType, email, password }),
      });

      if (!res.ok) {
        const msg = (await res.json().catch(() => ({})))?.error || "Login failed";
        throw new Error(msg);
      }

      // success: redirect or navigate
      // navigate("/");
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main>
      <h1>Tools for Tasks</h1>
      <h6>Never forget a tool again. Save time and money</h6>

      <div id="loginForm-container">
        {error && <p id="login-error" className="error">{error}</p>}

        <form id="login-form" onSubmit={handleSubmit}>
          <select
            id="loginForm-accountType"
            name="accountType"
            value={accountType}
            onChange={(e) => setAccountType(e.target.value)}
            required
          >
            <option value="" disabled hidden>Account Type</option>
            <option value="owner">Owner</option>
            <option value="employee">Employee</option>
          </select>

          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <input
            type="password"
            name="password"
            placeholder="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            required
          />

          <button type="submit" disabled={!csrfToken}>Log In</button>
          <Link to="/forgot-password">Forgot Password?</Link>
        </form>

        <hr />

        <div id="createAccount-container">
          <Link id="createAccount-btn" to="/create-account">Create Account</Link>
        </div>
      </div>
    </main>
  );
}
