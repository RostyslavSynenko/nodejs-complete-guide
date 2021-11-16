const path = require('path');

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');

const errorController = require('./controllers/error');
const User = require('./models/user');
const isAuth = require('./middleware/is-auth');

const authRouter = require('./routes/auth');
const adminRouter = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const MONGODB_URI =
  'mongodb+srv://rsynenko:yy87JCLX00kQHWyA@cluster0-5h0mx.mongodb.net/node-complete?retryWrites=true&w=majority';

const app = express();
const store = new MongoDBStore({
  uri: MONGODB_URI,
  collection: 'sessions'
});
const csrfProtection = csrf();

store.on('error', error => {
  console.log(error);
});

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use(
  session({
    secret: 'sessionSecret',
    resave: false,
    saveUninitialized: false,
    store
  })
);
app.use(csrfProtection);
app.use(flash());

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }

  User.findById(req.session.user._id)
    .then(user => {
      req.user = user;

      next();
    })
    .catch(err => {
      console.log(err);
    });
});

app.use((req, res, next) => {
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();

  next();
});

app.use(authRouter);
app.use('/admin', isAuth, adminRouter);
app.use(shopRoutes);

app.use(errorController.getPageNotFound);

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(3000, () => console.log('\nServer running on port 3000\n'));
  })
  .catch(err => {
    console.log(err);
  });
