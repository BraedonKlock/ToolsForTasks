/**This file is holds the controllers for a user who is NOT logged in */
const jwt = require("jsonwebtoken");
const crypto = require("crypto");

const User = require("../models/user");
const Employee = require("../models/employee");
const db = require("../util/database");
const { sendPasswordResetEmail } = require("../util/email");

const bcrypt = require("bcryptjs");

const ACCESS_TTL = "60m";
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;
const RESET_TOKEN_EXPIRY_MINUTES = 15;

function signAccess({ id, role, orgId, companyName, employeeId }) {
  return jwt.sign(
    {
      sub: String(id),
      role,
      orgId: String(orgId),
      companyName,
      employeeId: employeeId ? String(employeeId) : null,
    },
    ACCESS_SECRET,
    { algorithm: "HS256", expiresIn: ACCESS_TTL }
  );
}

/**------------------------------------------------------------------------------------------------ */

exports.login = async (req, res, next) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const password = (req.body.password || "").trim();

    if (!email || !password) {
      return res.status(400).json({ error: "Missing fields" });
    }

    const [rows] = await User.findAccountByEmail(email);

    if (!rows || rows.length === 0) {
      return res.status(401).json({ error: "Invalid email or password" });
    }

    if (rows.length > 1) {
      return res.status(409).json({ error: "Multiple accounts use this email. Contact the owner to fix it." });
    }

    const acc = rows[0];

    const ok = await bcrypt.compare(password, acc.password);
    if (!ok) return res.status(401).json({ error: "Invalid email or password" });

    const orgId = acc.org_id;

    let name = null;
    if (acc.account_type === "employee" && acc.employee_id) {
      const [empRows] = await db.execute(
        "SELECT name FROM employees WHERE org_id = ? AND id = ? LIMIT 1",
        [orgId, acc.employee_id]
      );
      if (empRows && empRows.length > 0) name = empRows[0].name;
    }

    const accessToken = signAccess({
      id: acc.id,
      role: acc.role,
      orgId,
      companyName: acc.companyName,
      employeeId: acc.employee_id || null,
    });

    return res.json({
      accessToken,
      user: {
        id: acc.id,
        role: acc.role,
        orgId,
        companyName: acc.companyName,
        employeeId: acc.employee_id || null,
        name,
      },
    });
  } catch (e) {
    return next(e);
  }
};


/**------------------------------------------------------------------------------------------------ */

exports.createAccount = async (req, res) => {
  try {
    const companyName = (req.body.companyName || "").trim();
    const email = (req.body.email || "").trim().toLowerCase();
    const password = (req.body.password || "").trim();
    const confirmPassword = (req.body.confirmPassword || "").trim();

    if (!companyName || !email || !password || !confirmPassword) {
      return res.status(400).json({ error: "Missing fields" });
    }

    if (password !== confirmPassword) {
      return res.status(400).json({ error: "Passwords do not match." });
    }

    const passwordHash = await bcrypt.hash(password, 12);


    const user = new User(companyName, email, passwordHash);
    const result = await user.createAccount();

    if (!result || result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Could not create account, please try again later." });
    }

    return res.status(200).json({ ok: true });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY" || err.errno === 1062) {
      return res.status(409).json({ error: "Email already in use." });
    }

    return res.status(500).json({ error: "Internal server error." });
  }
};


/**------------------------------------------------------------------------------------------------ */

exports.forgotPassword = async (req, res, next) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();

    if (!email) {
      return res.status(400).json({ error: "Email is required." });
    }

    // Check if account exists
    const [rows] = await User.findAccountByEmail(email);

    // Always return success to prevent email enumeration
    // But only send email if account exists
    if (rows && rows.length > 0) {
      // Generate a secure random token
      const resetToken = crypto.randomBytes(32).toString("hex");

      // Set expiry time (15 minutes from now)
      const expiry = new Date(Date.now() + RESET_TOKEN_EXPIRY_MINUTES * 60 * 1000);

      // Store the token in database
      await User.storeResetToken(email, resetToken, expiry);

      // Send the email (don't await to prevent timing attacks)
      sendPasswordResetEmail(email, resetToken).catch((err) => {
        console.error("Failed to send password reset email:", err.message);
      });
    }

    // Always return success (security best practice)
    return res.status(200).json({
      ok: true,
      message: "If an account exists with that email, a reset link has been sent.",
    });
  } catch (err) {
    console.error("Forgot password error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again later." });
  }
};


/**------------------------------------------------------------------------------------------------ */

exports.resetPassword = async (req, res, next) => {
  try {
    const token = (req.body.token || "").trim();
    const password = (req.body.password || "").trim();

    if (!token || !password) {
      return res.status(400).json({ error: "Token and password are required." });
    }

    if (password.length < 6) {
      return res.status(400).json({ error: "Password must be at least 6 characters." });
    }

    // Find account by reset token
    const [rows] = await User.findByResetToken(token);

    if (!rows || rows.length === 0) {
      return res.status(400).json({ error: "Invalid or expired reset token." });
    }

    const account = rows[0];

    // Check if token has expired
    if (new Date(account.password_reset_expiry) < new Date()) {
      return res.status(400).json({ error: "Reset token has expired. Please request a new one." });
    }

    // Hash the new password
    const passwordHash = await bcrypt.hash(password, 12);

    // Update password and clear token
    await User.updatePasswordAndClearToken(account.email, passwordHash);

    return res.status(200).json({
      ok: true,
      message: "Password has been reset successfully.",
    });
  } catch (err) {
    console.error("Reset password error:", err);
    return res.status(500).json({ error: "Something went wrong. Please try again later." });
  }
};
