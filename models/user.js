const { ObjectId } = require('mongodb');

const { getDb } = require('../util/database');

class User {
  constructor(username, email, cart, orders, id) {
    this.name = username;
    this.email = email;
    this.cart = cart || { items: [] };
    this.orders = orders || { items: [] };
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
    const updatedCartItems = [...this.cart.items];
    let newQuantity = 1;

    if (cartProductIndex === -1) {
      updatedCartItems.push({
        productId: new ObjectId(product._id),
        quantity: newQuantity
      });
    } else {
      newQuantity = this.cart.items[cartProductIndex].quantity + 1;
      updatedCartItems[cartProductIndex].quantity = newQuantity;
    }

    const updatedCart = {
      items: updatedCartItems
    };

    return db.collection('users').updateOne(
      { _id: this._id },
      {
        $set: {
          cart: updatedCart
        }
      }
    );
  }

  deleteItemFromCart(id) {
    const db = getDb();
    const updatedCartItems = this.cart.items.filter(
      cartItem => cartItem.productId.toString() !== id
    );

    return db.collection('users').updateOne(
      { _id: this._id },
      {
        $set: {
          cart: {
            items: updatedCartItems
          }
        }
      }
    );
  }

  getCart() {
    const db = getDb();
    const productIds = this.cart.items.map(cartItem => cartItem.productId);

    return db
      .collection('products')
      .find({ _id: { $in: productIds } })
      .toArray()
      .then(products => {
        return products.map(product => {
          return {
            ...product,
            quantity: this.cart.items.find(
              cartItem =>
                cartItem.productId.toString() === product._id.toString()
            ).quantity
          };
        });
      });
  }

  addOrder() {
    const db = getDb();

    return this.getCart()
      .then(products => {
        const order = {
          items: products,
          user: {
            _id: this._id,
            name: this.name
          }
        };

        return db.collection('orders').insertOne(order);
      })
      .then(result => {
        this.cart = { items: [] };

        db.collection('users').updateOne(
          { _id: this._id },
          {
            $set: {
              cart: this.cart
            }
          }
        );

        return result;
      });
  }

  getOrders() {
    const db = getDb();

    return db.collection('orders').find({ 'user._id': this._id }).toArray();
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
