const Cart = require('../models/cart');
const Product = require('../models/product');

const getProducts = (req, res) => {
  Product.fetchAll()
    .then(([products]) => {
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
    .then(([[product]]) => {
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
  Product.fetchAll()
    .then(([products]) => {
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
  Cart.getCart(cart => {
    Product.fetchAll()
      .then(([products]) => {
        const cartProducts = [];

        for (const product of products) {
          const cartProductData = cart.products.find(
            cartProduct => cartProduct.id === product.id
          );

          if (cartProductData) {
            cartProducts.push({
              productData: product,
              qty: cartProductData.qty
            });
          }
        }

        res.render('shop/cart', {
          pageTitle: 'Your Cart',
          path: '/cart',
          products: cartProducts
        });
      })
      .catch(err => {
        console.log(err);
      });
  });
};

const postCart = (req, res) => {
  const { productId } = req.body;

  Product.findById(productId)
    .then(([[product]]) => {
      Cart.addProduct(productId, product.price);

      res.redirect('/cart');
    })
    .catch(err => {
      console.log(err);
    });
};

const postCartDeleteProduct = (req, res) => {
  const { productId } = req.body;

  Product.findById(productId)
    .then(([[product]]) => {
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
