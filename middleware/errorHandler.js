// middleware/errorHandler.js
module.exports = (err, req, res, next) => {

  const status = err.status || 500;
  let message = err.message || 'Something went wrong.';

  switch (status) {
    case 400:
      message = 'Bad request — something was wrong with your input.';
      break;
    case 401:
      message = 'Unauthorized — please log in again.';
      break;
    case 403:
      message = 'Forbidden — you do not have permission for this action.';
      break;
    case 404:
      message = 'The page or resource you were looking for was not found.';
      break;
    case 409:
      message = 'Conflict — this record already exists or is in use.';
      break;
    case 500:
      message = 'Internal server error — please try again later.';
      break;
    default:
      message = err.message || 'An unexpected error occurred.';
  }

  res.status(status).render('error', {
    pageTitle: status === 404 ? 'Not Found' : 'Error',
    path: '/loggedin',
    companyname: req.session?.companyname,
    employeename: req.session?.employeename,
    message,
  });
};
