const path = require('path');

const express = require('express');

const errorController = require('./controllers/error');
const sequelize = require('./util/database');
const Product = require('./models/product');
const User = require('./models/user');
const Cart = require('./models/cart');
const CartItem = require('./models/cart-item');

const adminRouter = require('./routes/admin');
const shopRoutes = require('./routes/shop');

const app = express();

app.set('view engine', 'ejs');
app.set('views', 'views');

app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static(path.join(__dirname, 'public')));

app.use((req, res, next) => {
  User.findByPk(1)
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

Product.belongsTo(User, {
  constrains: true,
  onDelete: 'CASCADE'
});
User.hasMany(Product);
User.hasOne(Cart);
Cart.belongsTo(User);
Cart.belongsToMany(Product, { through: CartItem });
Product.belongsToMany(Cart, { through: CartItem });

sequelize
  .sync()
  .then(() => {
    return User.findByPk(1);
  })
  .then(user => {
    if (!user) {
      return User.create({
        name: 'Rostyslav',
        email: 'test@test.com'
      });
    }

    return user;
  })
  .then(user => {
    return Promise.all([user.getCart(), user]);
  })
  .then(([cart, user]) => {
    if (!cart) {
      return user.createCart();
    }

    return cart;
  })
  .then(cart => {
    app.listen(3000, () => console.log('Server running on port 3000'));
  })
  .catch(err => {
    console.log(err);
  });
