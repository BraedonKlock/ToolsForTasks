import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/LoginPage.css";
import { API_URL } from "../config/api";

export default function ForgetPasswordPage() {
  const [email, setEmail] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");
    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/forgot-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email: email.trim().toLowerCase() }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setSuccess("If an account exists with that email, we'll send a link to reset your password.");
      setEmail("");
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="login-page">
      <h1>Reset Your Password</h1>
      <h6>Enter your email to receive a password reset link</h6>

      <div id="loginForm-container">
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        <form id="login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
            disabled={isLoading}
          />

          <button type="submit" disabled={isLoading}>
            {isLoading ? "Sending..." : "Send Reset Link"}
          </button>
          <Link to="/login">Back to Login</Link>
        </form>
      </div>
    </main>
  );
}
