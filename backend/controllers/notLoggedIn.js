/**This file is holds the controllers for a user who is NOT logged in */
const jwt = require("jsonwebtoken");

const User = require('../models/user');
const Employee = require('../models/employee');
const db = require('../util/database');

const bcrypt = require('bcryptjs'); // importing encryption for user passwords

/**-------------------------------------------------POST LOG IN------------------------------------------------------ */
/**Handling the post req when a user logs in */
const ACCESS_TTL = "15m"; // short-lived is best
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

/**-----------------------------------------------GET CREATE ACCOUNT---------------------------------------------------- */
/**Rendering create account page upon get request */
exports.getCreateAccount = (req,res,next) => {
  const error = req.query.error || null;
    res.status(200).render('home/createAccount', {
        pageTitle: 'Tools for Tasks - Create Account',
        path: '/',
        error
    });
};

/**----------------------------------------------POST CREATE ACCOUND---------------------------------------------------- */
/**Handling post request for when a user creates an account */
exports.postCreateAccount = (req,res,next) => {
    const type = req.body.businessType; // getting the business type for account
    const name = req.body.companyName;  //getting the company name for account
    const email = req.body.email; // getting the email for acccount
    const password = req.body.password; // getting the password for the account

    db.execute('SELECT * FROM organizations WHERE email = ? LIMIT 1', [email]).then(([rows]) => {
      if (rows.length > 0) {
        return res.redirect(303,'/create-account?error=Email already exists');
      };
      
      return bcrypt.hash(password, 12) // encrypting password. second argument is the cost factor (# of times hashed)
      .then((hashedPassword) => { // bycript returns a promise that encrypted password is stored in hashPassword
        const newUser = new User(type, name, email, hashedPassword) // new user is created
        return newUser.save() // new user saved to database
      })
      .then(() => {
        res.redirect(303,'/loggedin'); // redirecting to loggedin route
      });
    })
      .catch(next);
};
