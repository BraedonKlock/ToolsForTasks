/**
 * This file is responsible for storing functions that authenticate routes
 */
const jwt = require("jsonwebtoken");

exports.requireAuth = (roles = []) => (req, res, next) => {
  const auth = req.headers.authorization || "";
  const token = auth.startsWith("Bearer ") ? auth.slice(7) : null;
  if (!token) return res.status(401).json({ error: "Missing token" });
  
  try {
    const payload = jwt.verify(token, process.env.JWT_ACCESS_SECRET);
    if (roles.length && !roles.includes(payload.role)) return res.status(403).json({ error: "Forbidden" });
    req.user = payload; // { sub, role, ... }
    next();
  } catch (e) {
    return res.status(401).json({ error: "Invalid/expired token" });
  }
};

/**Function to confirm user is logged in by checking the loggedin flag set in the home controller postLogin function */
function requireLogin(req, res, next) {
  if (req.session?.isLoggedIn) return next();
  return res.redirect('/login'); 
}

function branchLogIn(req,res,next) {
  if(req.session?.isLoggedIn) return res.redirect('/loggedin');
  return next();
}

function requireRole(...allowedRoles) {
  return (req, res, next) => {
    if (allowedRoles.includes(req.session.role)) {
      return next();
    }
    return res.status(403).render('errors/403', { message: 'Forbidden' });
  };
}

/**passing in csrf tokens for authenticating user  */
function attachCsrfToken(req, res, next) {
  res.locals.csrfToken = req.csrfToken();
  next();
}

module.exports = { requireLogin, branchLogIn,attachCsrfToken, requireRole };
