const User = require('../models/user');
const bcrypt = require('bcryptjs');

/**Home page route */
exports.getIndex = (req, res, next) => {
    res.render('home/index', {
        pageTitle: 'Tools for Tasks - Home',
        path: '/'
    });
};

exports.getLogin = (req, res, next) => {
    res.render('home/login', {
        pageTitle: 'Tools for Tasks - Login',
        path: '/'
    });
};

exports.postLogin = (req, res, next) => {
  const email = (req.body.email || '').trim().toLowerCase();
  const password = req.body.password || '';

    User.findUser(email)               // -> Promise<[rows]>
    .then(([rows]) => {
      if (!rows || rows.length === 0) {
        return res.status(401).render('home/login', {
          pageTitle: 'Tools for Tasks - Login',
          path: '/',
          error: 'Invalid email or password.'
        });
      }

      const user = rows[0];          // { id, email, password: <hash>, ... }

      // bcrypt.compare returns a Promise
      return bcrypt.compare(password, user.password)
        .then((ok) => {
          if (!ok) {
            return res.status(401).render('home/login', {
              pageTitle: 'Tools for Tasks - Login',
              path: '/',
              error: 'Invalid email or password.'
            });
          }

            // success
            req.session.email = user.email;
            return req.session.save((err) => {
            if (err) return next(err);
            return res.redirect('/owner');
            });
        });
    })
    .catch(next);
};

exports.getCreateAccount = (req,res,next) => {
    res.render('home/createAccount', {
        pageTitle: 'Tools for Tasks - Create Account',
        path: '/'
    });
};

exports.postCreateAccount = (req,res,next) => {
    const type = req.body.businessType;
    const name = req.body.companyName;
    const email = req.body.email;
    const password = req.body.password;

    return bcrypt.hash(password, 12)
    .then((hashedPassword) => {
    const newUser = new User(type, name, email, hashedPassword)
    return newUser.save()
    })
    .then(() => {
        res.redirect('/owner');
    })
    .catch(next);
};
