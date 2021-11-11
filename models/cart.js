const fs = require('fs');
const path = require('path');

const rootDir = require('../util/path');

const cartPath = path.join(rootDir, 'data', 'cart.json');

class Cart {
  static addProduct(id, productPrice) {
    fs.readFile(cartPath, (err, data) => {
      let cart = { products: [], totalPrice: 0 };

      if (!err) {
        cart = JSON.parse(data);
      }

      const existingProductIndex = cart.products.findIndex(
        product => product.id === +id
      );
      const existingProduct = cart.products[existingProductIndex];
      let updatedProduct;

      if (existingProduct) {
        updatedProduct = { ...existingProduct };
        updatedProduct.qty += 1;

        cart.products[existingProductIndex] = updatedProduct;
      } else {
        updatedProduct = { id: +id, qty: 1 };

        cart.products = [...cart.products, updatedProduct];
      }

      cart.totalPrice += +productPrice;

      fs.writeFile(cartPath, JSON.stringify(cart), err => {
        console.log(err);
      });
    });
  }

  static deleteProduct(id, productPrice) {
    fs.readFile(cartPath, (err, data) => {
      if (err) {
        return;
      }

      const updatedCart = { ...JSON.parse(data) };
      const product = updatedCart.products.find(product => product.id === +id);

      if (!product) {
        return;
      }

      updatedCart.products = updatedCart.products.filter(
        product => product.id !== +id
      );
      updatedCart.totalPrice -= product.qty * productPrice;

      fs.writeFile(cartPath, JSON.stringify(updatedCart), err => {
        console.log(err);
      });
    });
  }

  static getCart(cb) {
    fs.readFile(cartPath, (err, data) => {
      if (err) {
        cb(null);
      } else {
        const cart = JSON.parse(data);

        cb(cart);
      }
    });
  }
}

module.exports = Cart;
