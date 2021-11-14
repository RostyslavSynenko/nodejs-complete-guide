const path = require('path');

const express = require('express');

const errorController = require('./controllers/error');
const { mongoConnect } = require('./util/database');
const User = require('./models/user');

const adminRouter = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findById('61901f0f41d1ee1a086021e3')
    .then(user => {
      req.user = new User(
        user.name,
        user.email,
        user.cart,
        user.orders,
        user._id
      );

      next();
    })
    .catch(err => {
      console.log(err);
    });
});

app.use('/admin', adminRouter);
app.use(shopRoutes);

app.use(errorController.getPageNotFound);

mongoConnect(() => {
  app.listen(3000, () => console.log('\nServer running on port 3000\n'));
});
