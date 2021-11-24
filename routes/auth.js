const express = require('express');
const { check, body } = require('express-validator');

const authController = require('../controllers/auth');
const User = require('../models/user');

const router = express.Router();

router.get('/login', authController.getLogin);

router.post(
  '/login',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .normalizeEmail(),
    body('password').trim()
  ],
  authController.postLogin
);

router.get('/signup', authController.getSignup);

router.post(
  '/signup',
  [
    check('email')
      .isEmail()
      .withMessage('Please enter a valid email.')
      .custom(value => {
        return User.findOne({ email: value }).then(user => {
          if (user) {
            return Promise.reject('User with such email already exists');
          }
        });
      })
      .normalizeEmail(),
    body(
      'password',
      'Please enter a password with only numbers and text and at least 5 characters.'
    )
      .isLength({
        min: 5
      })
      .isAlphanumeric()
      .trim(),
    body('confirmPassword').custom((value, { req }) => {
      if (value !== req.body.password) {
        throw new Error('Passwords have to match!');
      }

      return true;
    })
  ],
  authController.postSignup
);

router.post('/logout', authController.postLogout);

router.get('/reset', authController.getReset);

router.post('/reset', authController.postReset);

router.get('/new-password/:token', authController.getNewPassword);

router.post('/new-password', authController.postNewPassword);

module.exports = router;
