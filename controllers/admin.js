const Product = require('../models/product');
const User = require('../models/user');

const getAddProduct = (req, res) => {
  res.render('admin/edit-product', {
    pageTitle: 'Add Product',
    path: '/admin/add-product',
    editing: false
  });
};

const postAddProduct = (req, res) => {
  const { title, imageUrl, price, description } = req.body;

  req.user
    .createProduct({
      title,
      imageUrl,
      price,
      description
    })
    .then(result => {
      console.log('Created Product');

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

  req.user
    .getProducts({ where: { id: productId } })
    .then(products => {
      const product = products[0];

      if (!product) {
        return res.redirect('/');
      }

      res.render('admin/edit-product', {
        pageTitle: 'Edit Product',
        path: '/admin/edit-product',
        editing: editMode,
        product
      });
    })
    .catch(err => {
      console.log(err);
    });
};

const postEditProduct = (req, res) => {
  const { productId, title, price, description, imageUrl } = req.body;

  Product.findByPk(+productId)
    .then(product => {
      return product.update({ title, imageUrl, description, price });
    })
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err);
    });
};

const postDeleteProduct = (req, res) => {
  const { productId } = req.body;

  Product.findByPk(productId)
    .then(product => {
      return product.destroy();
    })
    .then(() => {
      res.redirect('/admin/products');
    })
    .catch(err => {
      console.log(err);
    });
};

const getProducts = (req, res) => {
  req.user
    .getProducts()
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
