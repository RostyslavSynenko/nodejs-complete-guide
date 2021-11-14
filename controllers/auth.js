const User = require('../models/user');

const getLogin = (req, res) => {
  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    isAuthenticated: req.session.isLoggedIn
  });
};

const postLogin = (req, res) => {
  User.findById('6191390c9bf2d538770f98af')
    .then(user => {
      req.session.isLoggedIn = true;
      req.session.user = user;

      return req.session.save(err => {
        console.log(err);

        res.redirect('/');
      });
    })

    .catch(err => {
      console.log(err);
    });
};

const postLogout = (req, res) => {
  req.session.destroy(err => {
    console.log(err);

    res.redirect('/');
  });
};

module.exports = { getLogin, postLogin, postLogout };
