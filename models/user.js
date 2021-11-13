const { ObjectId } = require('mongodb');

const { getDb } = require('../util/database');

class User {
  constructor(username, email, cart, id) {
    this.name = username;
    this.email = email;
    this.cart = cart || { items: [] };
    this._id = new ObjectId(id);
  }

  save() {
    const db = getDb();

    return db
      .collection('users')
      .insertOne(this)
      .then(result => {
        console.log(result);

        return result;
      })
      .catch(err => {
        console.log(err);
      });
  }

  addToCart(product) {
    const db = getDb();
    const cartProductIndex = this.cart.items.findIndex(
      cartProduct => cartProduct.productId.toString() === product._id.toString()
    );
    let updatedCart;

    if (cartProductIndex === -1) {
      updatedCart = {
        items: [{ productId: new ObjectId(product._id), quantity: 1 }]
      };
    } else {
      updatedCart = this.cart.items.map((cartProduct, i) => {
        if (cartProductIndex === i) {
          return {
            productId: new ObjectId(cartProduct._id),
            quantity: cartProduct.quantity + 1
          };
        }

        return cartProduct;
      });
    }

    return db.collection('users').updateOne(
      { _id: this._id },
      {
        $set: {
          cart: updatedCart
        }
      }
    );
  }

  static findById(id) {
    const db = getDb();

    return db
      .collection('users')
      .find({ _id: new ObjectId(id) })
      .next()
      .then(user => {
        console.log(user);

        return user;
      })
      .catch(err => {
        console.log(err);
      });
  }
}

module.exports = User;
