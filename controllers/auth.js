const bcrypt = require('bcryptjs');

const User = require('../models/user');

const getLogin = (req, res) => {
  let errorMessage = req.flash('error');

  if (errorMessage.length > 0) {
    errorMessage = errorMessage[0];
  } else {
    errorMessage = null;
  }

  res.render('auth/login', {
    pageTitle: 'Login',
    path: '/login',
    errorMessage
  });
};

const postLogin = (req, res) => {
  const { email, password } = req.body;

  User.findOne({ email })
    .then(user => {
      if (!user) {
        req.flash('error', 'Invalid email or password');

        return res.redirect('/login');
      }

      bcrypt
        .compare(password, user.password)
        .then(doMatch => {
          if (!doMatch) {
            req.flash('error', 'Invalid email or password');

            return res.redirect('/login');
          }

          req.session.isLoggedIn = true;
          req.session.user = user;

          req.session.save(err => {
            console.log(err);

            res.redirect('/');
          });
        })
        .catch(err => {
          console.log(err);

          res.redirect('/login');
        });
    })

    .catch(err => {
      console.log(err);
    });
};

const getSignup = (req, res) => {
  let errorMessage = req.flash('error');

  if (errorMessage.length > 0) {
    errorMessage = errorMessage[0];
  } else {
    errorMessage = null;
  }

  res.render('auth/signup', {
    pageTitle: 'Signup',
    path: '/signup',
    errorMessage
  });
};

const postSignup = (req, res) => {
  const { email, password, confirmPassword } = req.body;

  User.findOne({ email })
    .then(user => {
      if (user) {
        req.flash('error', 'User with such email already exists');

        return res.redirect('/signup');
      }

      return bcrypt
        .hash(password, 12)
        .then(hashedPassword => {
          const newUser = new User({
            email,
            password: hashedPassword,
            cart: { items: [] }
          });

          return newUser.save();
        })
        .then(() => {
          res.redirect('/login');
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

module.exports = { getLogin, postLogin, getSignup, postSignup, postLogout };
