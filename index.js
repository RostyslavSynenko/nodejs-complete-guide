const path = require('path');

const express = require('express');
const mongoose = require('mongoose');
const session = require('express-session');
const MongoDBStore = require('connect-mongodb-session')(session);
const csrf = require('csurf');
const flash = require('connect-flash');
const multer = require('multer');

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

const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'images');
  },
  filename: (req, file, cb) => {
    cb(null, Date.now() + '-' + file.originalname);
  }
});
const fileFilter = (req, file, cb) => {
  const isMimeTypeAccepted =
    file.mimetype === 'image/png' ||
    file.mimetype === 'image/jpg' ||
    file.mimetype === 'image/jpeg';

  cb(null, isMimeTypeAccepted);
};

store.on('error', err => {
  console.log(err);
});

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(multer({ storage, fileFilter }).single('image'));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));
app.use('/images', express.static(path.join(__dirname, 'images')));
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
  res.locals.isAuthenticated = req.session.isLoggedIn;
  res.locals.csrfToken = req.csrfToken();

  next();
});

app.use((req, res, next) => {
  if (!req.session.user) {
    return next();
  }

  User.findById(req.session.user._id)
    .then(user => {
      if (!req.session.user) {
        return next();
      }

      req.user = user;

      next();
    })
    .catch(err => {
      console.log(err);

      const error = new Error(err);

      error.httpStatusCode = 500;

      return next(error);
    });
});

app.use(authRouter);
app.use('/admin', isAuth, adminRouter);
app.use(shopRoutes);

app.get('/500', errorController.get500);

app.use(errorController.getPageNotFound);

app.use((error, req, res, next) => {
  console.log(error);

  res.status(500).render('500', {
    pageTitle: 'Error',
    path: '500'
  });
});

mongoose
  .connect(MONGODB_URI)
  .then(() => {
    app.listen(3000, () => console.log('\nServer running on port 3000\n'));
  })
  .catch(err => {
    console.log(err);
  });
