const fs = require('fs');
const path = require('path');

const rootDir = require('../util/path');

const getProductsFromFile = cb => {
  const productsPath = path.join(rootDir, 'data', 'products.json');

  fs.readFile(productsPath, (err, data) => {
    if (err) {
      return cb([]);
    }

    cb(JSON.parse(data));
  });
};

class Product {
  constructor(title) {
    this.title = title;
  }

  save() {
    const productsPath = path.join(rootDir, 'data', 'products.json');

    getProductsFromFile(products => {
      products.push(this);

      fs.writeFile(productsPath, JSON.stringify(products), err => {
        console.log(err);
      });
    });
  }

  static fetchAll(cb) {
    getProductsFromFile(cb);
  }
}

module.exports = Product;
