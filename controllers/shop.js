const fs = require('fs');
const path = require('path');
const PDFDocument = require('pdfkit');
const stripe = require('stripe')('Secret key');

const Product = require('../models/product');
const Order = require('../models/order');

const ITEMS_PER_PAGE = 1;

const getProducts = (req, res, next) => {
  const { page = 1 } = req.query;
  let totalProducts;

  Product.find()
    .countDocuments()
    .then(numProducts => {
      totalProducts = numProducts;

      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(products => {
      res.render('shop/product-list', {
        prods: products,
        pageTitle: 'All Products',
        path: '/products',
        hasNextPage: ITEMS_PER_PAGE * page < totalProducts,
        hasPreviousPage: page > 1,
        currentPage: +page,
        nextPage: +page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      console.log(err);

      const error = new Error(err);

      error.httpStatusCode = 500;

      return next(error);
    });
};

const getProduct = (req, res, next) => {
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

      const error = new Error(err);

      error.httpStatusCode = 500;

      return next(error);
    });
};

const getIndex = (req, res, next) => {
  const { page = 1 } = req.query;
  let totalProducts;

  Product.find()
    .countDocuments()
    .then(numProducts => {
      totalProducts = numProducts;

      return Product.find()
        .skip((page - 1) * ITEMS_PER_PAGE)
        .limit(ITEMS_PER_PAGE);
    })
    .then(products => {
      res.render('shop/index', {
        prods: products,
        pageTitle: 'Shop',
        path: '/',
        hasNextPage: ITEMS_PER_PAGE * page < totalProducts,
        hasPreviousPage: page > 1,
        currentPage: +page,
        nextPage: +page + 1,
        previousPage: page - 1,
        lastPage: Math.ceil(totalProducts / ITEMS_PER_PAGE)
      });
    })
    .catch(err => {
      console.log(err);

      const error = new Error(err);

      error.httpStatusCode = 500;

      return next(error);
    });
};

const getCart = (req, res, next) => {
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

      const error = new Error(err);

      error.httpStatusCode = 500;

      return next(error);
    });
};

const postCart = (req, res, next) => {
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

      const error = new Error(err);

      error.httpStatusCode = 500;

      return next(error);
    });
};

const postCartDeleteProduct = (req, res, next) => {
  const { productId } = req.body;

  req.user
    .deleteItemFromCart(productId)
    .then(result => {
      res.redirect('/cart');
    })
    .catch(err => {
      console.log(err);

      const error = new Error(err);

      error.httpStatusCode = 500;

      return next(error);
    });
};

const postOrder = (req, res, next) => {
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
          email: user.email,
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

      const error = new Error(err);

      error.httpStatusCode = 500;

      return next(error);
    });
};

const getOrders = (req, res, next) => {
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

      const error = new Error(err);

      error.httpStatusCode = 500;

      return next(error);
    });
};

const getInvoice = (req, res, next) => {
  const { orderId } = req.params;

  Order.findById(orderId)
    .then(order => {
      if (!order) {
        return next(new Error('No order found.'));
      }

      if (order.user.userId.toString() !== req.user._id.toString()) {
        return next(new Error('Unauthorized'));
      }

      const invoiceName = `invoice-${orderId}.pdf`;
      const invoicePath = path.join('data', 'invoices', invoiceName);

      const pdfDoc = new PDFDocument();

      res.setHeader('Content-Type', 'application/pdf');
      res.setHeader(
        'Content-Disposition',
        `attachment; filename=${invoiceName}`
      );

      pdfDoc.pipe(fs.createWriteStream(invoicePath));
      pdfDoc.pipe(res);

      pdfDoc.fontSize(26).text('Invoice', {
        underline: true
      });
      pdfDoc.text('--------------------');

      let totalPrice = 0;

      order.products.forEach(({ product, quantity }) => {
        totalPrice += quantity * product.price;

        pdfDoc
          .fontSize(14)
          .text(`${product.title} - ${quantity} x $${product.price}`);
      });

      pdfDoc.text('____________________');
      pdfDoc.fontSize(20).text(`Total Price: $${totalPrice}`);

      pdfDoc.end();
    })
    .catch(err => {
      next(err);
    });
};

const getCheckout = (req, res, next) => {
  let products;
  let totalSum = 0;

  req.user
    .populate('cart.items.product')
    .then(user => {
      totalSum = 0;
      products = user.cart.items;

      products.forEach(({ product, quantity }) => {
        totalSum += product.price * quantity;
      });

      return stripe.checkout.sessions.create({
        payment_method_types: ['card'],
        line_items: products.map(({ product, quantity }) => ({
          name: product.title,
          description: product.description,
          amount: product.price * 100,
          currency: 'usd',
          quantity
        })),
        success_url: `${req.protocol}://${req.get('host')}/checkout/success`,
        cancel_url: `${req.protocol}://${req.get('host')}/checkout/cancel`
      });
    })
    .then(session => {
      res.render('shop/checkout', {
        pageTitle: 'Checkout',
        path: '/checkout',
        products,
        totalSum,
        sessionId: session.id
      });
    })
    .catch(err => {
      console.log(err);

      const error = new Error(err);

      error.httpStatusCode = 500;

      return next(error);
    });
};

const getCheckoutSuccess = (req, res, next) => {
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
          email: user.email,
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

      const error = new Error(err);

      error.httpStatusCode = 500;

      return next(error);
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
  getOrders,
  getInvoice,
  getCheckout,
  getCheckoutSuccess
};
