const { validationResult } = require('express-validator');

const Product = require('../models/product');

const getAddProduct = (req, res) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false,
    hasError: false,
    product: { title: '', pricee: '', descriptione: '', imageUrle: '' },
    errorMessage: null,
    validationErrors: []
  });
};

const postAddProduct = (req, res) => {
  const { title, price, description, imageUrl } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Add Product',
      path: '/admin/add-product',
      editing: false,
      hasError: true,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      product: { title, price, description, imageUrl }
    });
  }

  const product = new Product({
    title,
    price,
    description,
    imageUrl,
    userId: req.user
  });

  product
    .save()
    .then(result => {
      res.redirect('/');
    })
    .catch(err => {
      console.log(err);
    });
};

const getEditProduct = (req, res) => {
  const editMode = req.query.edit === 'true';

  if (!editMode) {
    return res.redirect('/');
  }

  const { productId } = req.params;

  Product.findById(productId)
    .then(product => {
      if (!product) {
        return res.redirect('/');
      }

      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product,
        hasError: false,
        errorMessage: null,
        validationErrors: []
      });
    })
    .catch(err => {
      console.log(err);
    });
};

const postEditProduct = (req, res) => {
  const { productId, title, price, description, imageUrl } = req.body;
  const errors = validationResult(req);

  if (!errors.isEmpty()) {
    return res.status(422).render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: true,
      hasError: true,
      errorMessage: errors.array()[0].msg,
      validationErrors: errors.array(),
      product: { _id: productId, title, price, description, imageUrl }
    });
  }

  Product.findById(productId)
    .then(product => {
      if (product.userId.toString() !== req.user._id.toString()) {
        return res.redirect('/');
      }

      product.title = title;
      product.price = price;
      product.description = description;
      product.imageUrl = imageUrl;

      return product.save().then(() => {
        res.redirect('/admin/products');
      });
    })
    .catch(err => {
      console.log(err);
    });
};

const postDeleteProduct = (req, res) => {
  const { productId } = req.body;

  Product.deleteOne({ _id: productId, userId: req.user._id })
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err);
    });
};

const getProducts = (req, res) => {
  Product.find({ userId: req.user._id })
    // .select('title price -_id')
    // .populate('userId', '-cart')
    .then(products => {
      res.render('admin/products', {
        prods: products,
        pageTitle: 'Admin Products',
        path: '/admin/products'
      });
    })
    .catch(err => {
      console.log(err);
    });
};

module.exports = {
  getAddProduct,
  postAddProduct,
  getEditProduct,
  postEditProduct,
  postDeleteProduct,
  getProducts
};
