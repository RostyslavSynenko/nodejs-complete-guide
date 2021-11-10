const Product = require('../models/product');

const getProducts = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('shop/product-list', {
      prods: products,
      pageTitle: 'All Products',
      path: '/products'
    });
  });
};

const getProduct = (req, res, next) => {
  const { productId } = req.params;

  Product.findById(productId, product => {
    res.render('shop/product-detail', {
      path: '/products',
      pageTitle: product.title,
      product
    });
  });
};

const getIndex = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('shop/index', {
      prods: products,
      pageTitle: 'Shop',
      path: '/'
    });
  });
};

const getCart = (req, res, next) => {
  res.render('shop/cart', {
    pageTitle: 'Your Cart',
    path: '/cart'
  });
};

const getOrders = (req, res, next) => {
  res.render('shop/orders', {
    pageTitle: 'Your Orders',
    path: '/orders'
  });
};

const getCheckout = (req, res, next) => {
  res.render('shop/checkout', {
    pageTitle: 'Checkout',
    path: '/checkout'
  });
};

module.exports = {
  getProducts,
  getProduct,
  getIndex,
  getCart,
  getOrders,
  getCheckout
};
