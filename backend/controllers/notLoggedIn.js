/**This file is holds the controllers for a user who is NOT logged in */

const User = require('../models/user');
const Employee = require('../models/employee');
const db = require('../util/database');

const bcrypt = require('bcryptjs'); // importing encryption for user passwords

/**-------------------------------------------------POST LOG IN------------------------------------------------------ */
/**Handling the post req when a user logs in */
exports.login = async (req, res, next) => {
  try {
    const email = (req.body.email || "").trim().toLowerCase();
    const password = req.body.password || "";
    const accountType = (req.body.accountType || "").toLowerCase();

    if (!email || !password || !accountType) {
      return res.status(400).json({ error: "Missing fields" });
    }

    if (accountType === "owner") {
      const [rows] = await User.findUser(email);
      if (!rows || rows.length === 0) {
        return res.status(401).json({ error: "Invalid email" });
      }

      const org = rows[0];
      const ok = await bcrypt.compare(password, org.password);
      if (!ok) return res.status(401).json({ error: "Invalid password" });

      // success: set session
      req.session.org = org.id;                  // for socket rooms
      req.session.companyname = org.companyName;
      req.session.loginid = org.id;
      req.session.isLoggedIn = true;
      req.session.email = org.email;
      req.session.role = org.role;

      return req.session.save(err => {
        if (err) return next(err);
        // Return JSON instead of redirect
        return res.json({
          ok: true,
          user: { id: org.id, role: org.role, companyName: org.companyName, email: org.email },
        });
      });
    }

    if (accountType === "employee") {
      const [rows] = await Employee.findEmployee(email);
      if (!rows || rows.length === 0) {
        return res.status(401).json({ error: "Invalid email" });
      }

      const emp = rows[0];
      const ok = await bcrypt.compare(password, emp.password);
      if (!ok) return res.status(401).json({ error: "Invalid password" });

      // (optional) fetch org for display name
      try {
        const [orgInfo] = await User.findUserbyId(emp.org_id);
        if (orgInfo && orgInfo.length > 0) {
          req.session.companyname = orgInfo[0].companyName;
        }
      } catch (_) { /* non-fatal */ }

      // success: set session
      req.session.employeename = emp.name;
      req.session.org = emp.org_id;
      req.session.loginid = emp.id;
      req.session.isLoggedIn = true;
      req.session.email = emp.email;
      req.session.role = emp.role;

      return req.session.save(err => {
        if (err) return next(err);
        return res.json({
          ok: true,
          user: { id: emp.id, role: emp.role, org: emp.org_id, email: emp.email, name: emp.name },
        });
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
