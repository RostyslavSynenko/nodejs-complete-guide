const Cart = require('../models/cart');
const Product = require('../models/product');

const getProducts = (req, res) => {
  Product.findAll()
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

  Product.findByPk(productId)
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
  Product.findAll()
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
    .getCart()
    .then(cart => {
      return cart.getProducts();
    })
    .then(products => {
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
  let quantity = 1;
  let fetchedCart;

  req.user
    .getCart()
    .then(cart => {
      fetchedCart = cart;

      return cart.getProducts({ where: { id: productId } });
    })
    .then(([product]) => {
      if (product) {
        quantity = product.cartItem.quantity + 1;

        return product;
      }

      return Product.findByPk(productId);
    })
    .then(product => {
      return fetchedCart.addProduct(product, { through: { quantity } });
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

  Product.findByPk(productId)
    .then(product => {
      Cart.deleteProduct(productId, product.price);

      res.redirect('/cart');
    })
    .catch(err => {
      console.log(err);
    });
};

const getOrders = (req, res) => {
  res.render('shop/orders', {
    pageTitle: 'Your Orders',
    path: '/orders'
  });
};

const getCheckout = (req, res) => {
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
