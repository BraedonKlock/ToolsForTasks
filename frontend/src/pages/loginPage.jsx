import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";
import { useContext } from "react";
import { AuthContext } from "../context/AuthContext";

export default function LoginPage() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const navigate = useNavigate();
  const { login } = useContext(AuthContext);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");

    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      if (!res.ok) {
        const msg = (await res.json().catch(() => ({})))?.error || "Login failed";
        throw new Error(msg);
      }

      const { accessToken, user } = await res.json();
      if (!accessToken) throw new Error("No accessToken from server");

      // after successful login
      login(accessToken, user);
      navigate("/loggedIn", { replace: true });
    } catch (err) {
      setError(err.message);
    }
  }

  return (
    <main className="login-page">
      <h1>Tools for Tasks</h1>
      <h6>Never forget a tool again. Save time and money</h6>

      <div id="loginForm-container">
        {error && <p id="login-error" className="error">{error}</p>}

        <form id="login-form" onSubmit={handleSubmit}>
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

          <button type="submit">Log In</button>
          <Link to="/forget-password">Forgot Password?</Link>
        </form>

        <hr />
        <div id="createAccount-container">
          <Link id="createAccount-btn" to="/create-account">Create Account</Link>
        </div>
      </div>
    </main>
  );
}
