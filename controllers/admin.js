const Product = require('../models/product');

const getAddProduct = (req, res, next) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

const postAddProduct = (req, res, next) => {
  const { title, imageUrl, price, description } = req.body;
  const product = new Product(null, title, imageUrl, description, price);

  product.save();

  res.redirect('/');
};

const getEditProduct = (req, res, next) => {
  const editMode = req.query.edit === 'true';

  if (!editMode) {
    return res.redirect('/');
  }

  const { productId } = req.params;

  Product.findById(productId, product => {
    if (!product) {
      return res.redirect('/');
    }

    res.render('admin/edit-product', {
      pageTitle: 'Edit Product',
      path: '/admin/edit-product',
      editing: editMode,
      product
    });
  });
};

const postEditProduct = (req, res, next) => {
  const { productId, title, price, description, imageUrl } = req.body;

  const updatedProduct = new Product(
    +productId,
    title,
    imageUrl,
    description,
    price
  );

  updatedProduct.save();

  res.redirect('/admin/products');
};

const postDeleteProduct = (req, res, next) => {
  const { productId } = req.body;

  Product.deleteById(productId);

  res.redirect('/admin/products');
};

const getProducts = (req, res, next) => {
  Product.fetchAll(products => {
    res.render('admin/products', {
      prods: products,
      pageTitle: 'Admin Products',
      path: '/admin/products'
    });
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
