const Cart = require('../models/cart');
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
  Cart.getCart(cart => {
    Product.fetchAll(products => {
      const cartProducts = [];

      for (const product of products) {
        const cartProductData = cart.products.find(
          cartProduct => cartProduct.id === product.id
        );

        if (cartProductData) {
          cartProducts.push({ productData: product, qty: cartProductData.qty });
        }
      }

      res.render('shop/cart', {
        pageTitle: 'Your Cart',
        path: '/cart',
        products: cartProducts
      });
    });
  });
};

const postCart = (req, res, next) => {
  const { productId } = req.body;

  Product.findById(productId, product => {
    Cart.addProduct(productId, product.price);

    res.redirect('/cart');
  });
};

const postCartDeleteProduct = (req, res, next) => {
  const { productId } = req.body;

  Product.findById(productId, product => {
    Cart.deleteProduct(productId, product.price);

    res.redirect('/cart');
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
  postCart,
  postCartDeleteProduct,
  getOrders,
  getCheckout
};
