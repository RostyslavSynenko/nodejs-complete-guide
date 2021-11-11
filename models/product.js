const fs = require('fs');
const path = require('path');

const rootDir = require('../util/path');
const Cart = require('./cart');

const productsPath = path.join(rootDir, 'data', 'products.json');

const getProductsFromFile = cb => {
  fs.readFile(productsPath, (err, data) => {
    if (err) {
      return cb([]);
    }

    cb(JSON.parse(data));
  });
};

class Product {
  constructor(id, title, imageUrl, description, price) {
    this.id = id;
    this.title = title;
    this.imageUrl = imageUrl;
    this.description = description;
    this.price = price;
  }

  save() {
    getProductsFromFile(products => {
      if (this.id) {
        const existingProductIndex = products.findIndex(
          product => product.id === +this.id
        );
        const updatedProducts = [...products];

        updatedProducts[existingProductIndex] = this;

        fs.writeFile(productsPath, JSON.stringify(updatedProducts), err => {
          console.log(err);
        });
      } else {
        this.id = Date.now();

        products.push(this);

        fs.writeFile(productsPath, JSON.stringify(products), err => {
          console.log(err);
        });
      }
    });
  }

  static deleteById(id) {
    getProductsFromFile(products => {
      const product = products.find(product => product.id === +id);
      const updatedProducts = products.filter(product => product.id !== +id);

      fs.writeFile(productsPath, JSON.stringify(updatedProducts), err => {
        if (!err) {
          Cart.deleteProduct(id, product.price);
        }

        console.log(err);
      });
    });
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }

  static findById(id, cb) {
    getProductsFromFile(products => {
      const product = products.find(product => product.id === +id);

      cb(product);
    });
  }
}

module.exports = Product;
