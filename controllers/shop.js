const Product = require('../models/product');
const Order = require('../models/order');

const getProducts = (req, res) => {
  Product.find()
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products'
      });
    })
    .catch(err => {
      console.log(err);
    });
};

const getProduct = (req, res) => {
  const { productId } = req.params;

  Product.findById(productId)
    .then(product => {
      res.render('shop/product-detail', {
        path: '/products',
        pageTitle: product.title,
        product
      });
    })
    .catch(err => {
      console.log(err);
    });
};

const getIndex = (req, res) => {
  Product.find()
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/'
      });
    })
    .catch(err => {
      console.log(err);
    });
};

const getCart = (req, res) => {
  req.user
    .populate('cart.items.product')
    .then(user => {
      const products = user.cart.items;

      res.render('shop/cart', {
        pageTitle: 'Your Cart',
        path: '/cart',
        products
      });
    })
    .catch(err => {
      console.log(err);
    });
};

const postCart = (req, res) => {
  const { productId } = req.body;

  Product.findById(productId)
    .then(product => {
      return req.user.addToCart(product);
    })
    .then(() => {
      res.redirect('/cart');
    })
    .catch(err => {
      console.log(err);
    });
};

const postCartDeleteProduct = (req, res) => {
  const { productId } = req.body;

  req.user
    .deleteItemFromCart(productId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => {
      console.log(err);
    });
};

const postOrder = (req, res) => {
  req.user
    .populate('cart.items.product')
    .then(user => {
      const products = user.cart.items.map(cartItem => {
        return {
          quantity: cartItem.quantity,
          product: { ...cartItem.product._doc }
        };
      });

      const order = new Order({
        products: products,
        user: {
          name: user.name,
          userId: user
        }
      });

      return order.save();
    })
    .then(result => {
      return req.user.clearCart();
    })
    .then(result => {
      res.redirect('/orders');
    })
    .catch(err => {
      console.log(err);
    });
};

const getOrders = (req, res) => {
  Order.find({ 'user.userId': req.user })
    .then(orders => {
      res.render('shop/orders', {
        pageTitle: 'Your Orders',
        path: '/orders',
        orders
      });
    })
    .catch(err => {
      console.log(err);
    });
};

module.exports = {
  getProducts,
  getProduct,
  getIndex,
  getCart,
  postCart,
  postCartDeleteProduct,
  postOrder,
  getOrders
};
