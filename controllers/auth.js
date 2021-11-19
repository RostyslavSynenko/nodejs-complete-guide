const bcrypt = require('bcryptjs');
const nodemailer = require('nodemailer');
const sendgridTransport = require('nodemailer-sendgrid-transport');

const User = require('../models/user');

const transporter = nodemailer.createTransport(
  sendgridTransport({
    auth: {
      api_key:
        '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'
    }
  })
);

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

          return transporter.sendMail({
            to: email,
            from: 'rostik-911@ukr.net',
            subject: 'Signup succeeded!',
            html: '<h1>You successfully signed up!</h1>'
          });
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
