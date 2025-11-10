/**This file is holds the controllers for a user who is NOT logged in */
const jwt = require("jsonwebtoken");

const User = require('../models/user');
const Employee = require('../models/employee');
const db = require('../util/database');

const bcrypt = require('bcryptjs'); // importing encryption for user passwords

/**-------------------------------------------------POST LOG IN------------------------------------------------------ */
/**Handling the post req when a user logs in */
const ACCESS_TTL = "60m";
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET; // set this in env

function signAccess({ id, role, orgId }) {
  return jwt.sign(
    { sub: String(id), role, orgId: String(orgId) }, // minimal claims
    ACCESS_SECRET,
    { algorithm: "HS256", expiresIn: ACCESS_TTL }
  );
}

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
      if (!rows || rows.length === 0) return res.status(401).json({ error: "Invalid email" });

      const org = rows[0];
      const ok = await bcrypt.compare(password, org.password);
      if (!ok) return res.status(401).json({ error: "Invalid password" });

      const accessToken = signAccess({ id: org.id, role: org.role, orgId: org.id });

      return res.json({
        accessToken,
        user: { id: org.id, role: org.role, orgId: org.id, companyName: org.companyName },
      });
    }

    // ---- EMPLOYEE ----
    if (accountType === "employee") {
      const [rows] = await Employee.findEmployee(email);
      if (!rows || rows.length === 0) return res.status(401).json({ error: "Invalid email" });

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

exports.createAccount = (req, res) => {

}