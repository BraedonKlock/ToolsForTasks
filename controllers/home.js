const User = require('../models/user');

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

exports.postLogin = (req,res,next) => {
    const email = req.body.email;
    const password = req.body.password

    authenticateLogin(email,password)
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

    const newUser = new User(type, name, email, password)
    newUser.save()
    .then(() => {
        res.redirect('/owner');
    })
    .catch(next);
};

