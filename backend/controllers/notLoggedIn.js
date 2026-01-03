/**This file is holds the controllers for a user who is NOT logged in */
const jwt = require("jsonwebtoken");

const User = require('../models/user');
const Employee = require('../models/employee');
const db = require('../util/database');

const bcrypt = require('bcryptjs'); // importing encryption for user passwords

const ACCESS_TTL = "60m";
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET; // set this in env

function signAccess({ id, role, orgId, companyName }) {
  return jwt.sign(
    { sub: String(id), role, orgId: String(orgId), companyName }, // minimal claims
    ACCESS_SECRET,
    { algorithm: "HS256", expiresIn: ACCESS_TTL }
  );
}
/**------------------------------------------------------------------------------------------------ */

exports.login = async (req, res, next) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";
    const accountType = (req.body.accountType || "").toLowerCase();

    if (!email || !password || !accountType) {
      return res.status(400).json({ error: "Missing fields" });
    }

    // ---- OWNER ----
    if (accountType === "owner") {
      const [rows] = await User.findUser(email);
      if (!rows || rows.length === 0) return res.status(401).json({ error: "Invalid Email or Account Type" });

      const org = rows[0];
      const ok = await bcrypt.compare(password, org.password);
      if (!ok) return res.status(401).json({ error: "Invalid password" });

      const accessToken = signAccess({ id: org.id, role: org.role, orgId: org.id, companyName: org.companyName });

      return res.json({
        accessToken,
        user: { id: org.id, role: org.role, orgId: org.id, companyName: org.companyName },
      });
    }

    // ---- EMPLOYEE ----
    if (accountType === "employee") {
      const [rows] = await Employee.findEmployee(email);
      if (!rows || rows.length === 0) return res.status(401).json({ error: "Invalid Email or Account Type" });

      const emp = rows[0];
      const ok = await bcrypt.compare(password, emp.password);
      if (!ok) return res.status(401).json({ error: "Invalid password" });

      const accessToken = signAccess({ id: emp.id, role: emp.role, orgId: emp.org_id });
      return res.json({
        accessToken,
        user: { id: emp.id, role: emp.role, orgId: emp.org_id, name: emp.name, companyName: emp.companyName },
      });
    }

    return res.status(400).json({ error: "Unknown accountType" });
  } catch (e) {
    return next(e);
  }
};

/**------------------------------------------------------------------------------------------------ */
exports.createAccount = async (req, res) => {
  try {

    const { businessType, companyName, email, password, confirmPassword } = req.body;

    email.trim().toLowerCase();
    password.trim();
    confirmPassword.trim();

    if (password != confirmPassword) {
      return res.status(500).json({error: "Passwords do not match."})
    }
    const passwordHash = await bcrypt.hash(password, 12);

    const user = new User(businessType, companyName, email, passwordHash);

    const result = await user.createAccount()

    if (!result || result.affectedRows === 0) {
      return res.status(404).json({error: "Could not create account, please try again later."})
    }

    res.status(200).json({
      ok: true
    })

  }catch(err) {
    if (err.code === "ER_DUP_ENTRY" || err.errno === 1062) {
      return res.status(409).json({ error: "Email already in use." });
    }

    res.status(500).json({error: "Internal server error."})
  }
}