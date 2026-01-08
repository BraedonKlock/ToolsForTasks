/**This file is holds the controllers for a user who is NOT logged in */
const jwt = require("jsonwebtoken");

const User = require("../models/user");
const Employee = require("../models/employee");
const db = require("../util/database");

const bcrypt = require("bcryptjs");

const ACCESS_TTL = "60m";
const ACCESS_SECRET = process.env.JWT_ACCESS_SECRET;

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


    const result = await User.createOwnerAccount(companyName, email, passwordHash);

    if (!result || result.affectedRows === 0) {
      return res
        .status(404)
        .json({ error: "Could not create account, please try again later." });
    }

    const newId = result.insertId;
    await db.execute(`UPDATE accounts SET org_id = id WHERE id = ?`, [newId]);

    return res.status(200).json({ ok: true });
  } catch (err) {
    if (err.code === "ER_DUP_ENTRY" || err.errno === 1062) {
      return res.status(409).json({ error: "Email already in use." });
    }

    return res.status(500).json({ error: "Internal server error." });
  }
};
