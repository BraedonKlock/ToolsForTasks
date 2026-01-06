import { useState } from "react";
import { Link } from "react-router-dom";
import "../styles/LoginPage.css";

export default function ForgetPasswordPage() {
  const [email, setEmail] = useState("");
  const [confirmation, setConfirmation] = useState("");

  function handleSubmit(e) {
    e.preventDefault();
    setConfirmation(
      "If an account exists with that email, we'll send a link to reset your password."
    );
    setEmail("");
  }

  return (
    <main className="login-page">
      <h1>Reset Your Password</h1>
      <h6>Enter your email to receive a password reset link</h6>

      <div id="loginForm-container">
        {confirmation && <p className="success">{confirmation}</p>}

        <form id="login-form" onSubmit={handleSubmit}>
          <input
            type="email"
            name="email"
            placeholder="Email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            required
          />

          <button type="submit">Send Reset Link</button>
          <Link to="/login">Back to Login</Link>
        </form>
      </div>
    </main>
  );
}
