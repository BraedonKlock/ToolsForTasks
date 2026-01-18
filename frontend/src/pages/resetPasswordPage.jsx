import { useState, useEffect } from "react";
import { Link, useSearchParams, useNavigate } from "react-router-dom";
import "../styles/LoginPage.css";
import { API_URL } from "../config/api";

export default function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const token = searchParams.get("token");

  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const [isValidToken, setIsValidToken] = useState(true);

  useEffect(() => {
    if (!token) {
      setIsValidToken(false);
      setError("Invalid or missing reset token. Please request a new password reset link.");
    }
  }, [token]);

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Passwords do not match.");
      return;
    }

    if (password.length < 6) {
      setError("Password must be at least 6 characters.");
      return;
    }

    setIsLoading(true);

    try {
      const res = await fetch(`${API_URL}/api/reset-password`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ token, password }),
      });

      const data = await res.json().catch(() => ({}));

      if (!res.ok) {
        throw new Error(data.error || "Something went wrong. Please try again.");
      }

      setSuccess("Your password has been reset successfully!");
      setPassword("");
      setConfirmPassword("");

      setTimeout(() => {
        navigate("/login", { replace: true });
      }, 2000);
    } catch (err) {
      setError(err.message);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <main className="login-page">
      <h1>Set New Password</h1>
      <h6>Enter your new password below</h6>

      <div id="loginForm-container">
        {error && <p className="error">{error}</p>}
        {success && <p className="success">{success}</p>}

        {isValidToken && !success && (
          <form id="login-form" onSubmit={handleSubmit}>
            <input
              type="password"
              name="password"
              placeholder="New Password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
              disabled={isLoading}
              minLength={6}
            />

            <input
              type="password"
              name="confirmPassword"
              placeholder="Confirm New Password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              required
              disabled={isLoading}
              minLength={6}
            />

            <button type="submit" disabled={isLoading}>
              {isLoading ? "Resetting..." : "Reset Password"}
            </button>
            <Link to="/login">Back to Login</Link>
          </form>
        )}

        {!isValidToken && (
          <div id="login-form">
            <Link to="/forget-password">Request New Reset Link</Link>
          </div>
        )}

        {success && (
          <div id="login-form">
            <p style={{ textAlign: "center", color: "var(--md-on-surface-variant)" }}>
              Redirecting to login...
            </p>
          </div>
        )}
      </div>
    </main>
  );
}
