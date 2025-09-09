/**This file is holds the controllers for a user who is NOT logged in */

const User = require('../models/user');
const Employee = require('../models/employee');

const bcrypt = require('bcryptjs'); // importing encryption for user passwords

/**-------------------------------------------------GET INDEX------------------------------------------------------ */
/**Home page route */
exports.getIndex = (req, res, next) => {
    res.render('home/index', {
        pageTitle: 'Tools for Tasks - Home',
        path: '/'
    });
};

/**-------------------------------------------------GET LOG IN------------------------------------------------------ */
/**rendering the log in page */
exports.getLogin = (req, res, next) => {
    res.render('home/login', {
        pageTitle: 'Tools for Tasks - Login',
        path: '/'
    });
};

/**-------------------------------------------------POST LOG IN------------------------------------------------------ */
/**Handling the post req when a user logs in */
exports.postLogin = (req, res, next) => {
  const email = (req.body.email || '').trim().toLowerCase(); // triming a string to prevent crashing if email is undefined
  const password = req.body.password || ''; // using an empty string to prevent crashing when comparing with database
  const accountType = (req.body.accountType || '').toLowerCase(); // accountType determines which database table to query
  
  /**OWNER account type */
  if (accountType === 'owner') {
    User.findUser(email) // finding the user by the email they entered               
    .then(([rows]) => { // when promise is returned im destructuring the first index of the 2d array where the user info is
      if (!rows || rows.length === 0) { // if login didnt work
        return res.status(401).render('home/login', {
          pageTitle: 'Tools for Tasks - Login',
          path: '/',
          error: 'Invalid email, password or account type.'
        });
      }

      const org = rows[0]; // getting the user. which is an object and storing it in user

      // bcrypt.compare returns a Promise
      return bcrypt.compare(password, org.password) // comparing the hashedPassword and using bcrypt to decrypt it 
        .then((ok) => { // storing the returned promise in ok 
          if (!ok) { // if unsuccessful (password isnt equal)
            return res.status(401).render('home/login', {
              pageTitle: 'Tools for Tasks - Login',
              path: '/',
              error: 'Invalid email or password.'
            });
          }

            /**Success */
            req.session.org = org.id; // used for socketio to join rooms
            req.session.companyname = org.companyName;
            req.session.loginid = org.id; 
            req.session.isLoggedIn = true; // storing loggedin flag in session to keep user logged in for route auth
            req.session.email = org.email; //
            req.session.role = org.role;
            return req.session.save((err) => { // saving session
            if (err) return next(err);
            return res.redirect('/loggedin'); // redirect to loggedin route
            });
        });
    })
    .catch(next);

  }
  /**EMPLOYEE account type */
  if (accountType === 'employee') {
    Employee.findEmployee(email).then(([rows]) => {
      if (!rows || rows.length === 0) { // if login didnt work
        return res.status(401).render('home/login', {
          pageTitle: 'Tools for Tasks - Login',
          path: '/',
          error: 'Invalid email, password or account type.'
        });
      }
      const emp = rows[0]; // getting the user. which is an object and storing it in user
      // bcrypt.compare returns a Promise
      return bcrypt.compare(password, emp.password) // comparing the hashedPassword and using bcrypt to decrypt it 
        .then((ok) => { // storing the returned promise in ok 
          if (!ok) { // if unsuccessful (password isnt equal)
            return res.status(401).render('home/login', {
              pageTitle: 'Tools for Tasks - Login',
              path: '/',
              error: 'Invalid email or password.'
            });
          }

          User.findUserbyId(emp.org_id).then(([orgInfo]) => {
            if(!orgInfo || orgInfo.length === 0) return;
            const org = orgInfo[0];
            /**Success */
            req.session.companyname = org.companyName;
          });
          req.session.employeename = emp.name;
          req.session.org = emp.org_id; // used for socketio to join rooms
          req.session.loginid = emp.id; 
          req.session.isLoggedIn = true; // storing loggedin flag in session to keep user logged in for route auth
          req.session.email = emp.email; //
          req.session.role = emp.role;
          console.log(req.session.role);
          return req.session.save((err) => { // saving session
          if (err) return next(err);
          return res.redirect('/loggedin'); // redirect to loggedin route
          });
      });
    })
    .catch(next);
  }
};

/**-----------------------------------------------GET CREATE ACCOUNT---------------------------------------------------- */
/**Rendering create account page upon get request */
exports.getCreateAccount = (req,res,next) => {
    res.render('home/createAccount', {
        pageTitle: 'Tools for Tasks - Create Account',
        path: '/'
    });
};

/**----------------------------------------------POST CREATE ACCOUND---------------------------------------------------- */
/**Handling post request for when a user creates an account */
exports.postCreateAccount = (req,res,next) => {
    const type = req.body.businessType; // getting the business type for account
    const name = req.body.companyName;  //getting the company name for account
    const email = req.body.email; // getting the email for acccount
    const password = req.body.password; // getting the password for the account

    bcrypt.hash(password, 12) // encrypting password. second argument is the cost factor (# of times hashed) 
    .then((hashedPassword) => { // bycript returns a promise that encrypted password is stored in hashPassword
    const newUser = new User(type, name, email, hashedPassword) // new user is created
    return newUser.save() // new user saved to database
    })
    .then(() => {
        res.redirect('/loggedin'); // redirecting to loggedin route
    })
    .catch(next);
};
