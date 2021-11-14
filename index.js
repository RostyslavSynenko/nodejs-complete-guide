const path = require('path');

const express = require('express');
const mongoose = require('mongoose');

const errorController = require('./controllers/error');
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
  User.findById('6191390c9bf2d538770f98af')
    .then(user => {
      req.user = user;

      next();
    })
    .catch(err => {
      console.log(err);
    });
});

app.use('/admin', adminRouter);
app.use(shopRoutes);

app.use(errorController.getPageNotFound);

mongoose
  .connect(
    'mongodb+srv://rsynenko:yy87JCLX00kQHWyA@cluster0-5h0mx.mongodb.net/node-complete?retryWrites=true&w=majority'
  )
  .then(() => {
    User.findOne().then(user => {
      if (!user) {
        const newUser = new User({
          name: 'Rostyslav',
          email: 'test@email.com',
          cart: { items: [] }
        });

        newUser.save();
      }
    });

    app.listen(3000, () => console.log('\nServer running on port 3000\n'));
  })
  .catch(err => {
    console.log(err);
  });
