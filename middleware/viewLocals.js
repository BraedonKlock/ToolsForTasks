/**
 * This file stores functions i want shared accross all views
 */

/**Passing in isloggedin for view display authentication */
module.exports = function viewLocals(req, res, next) {
  res.locals.isLoggedIn = !!req.session?.isLoggedIn;
  res.locals.role = req.session?.role || null;
  next();
};