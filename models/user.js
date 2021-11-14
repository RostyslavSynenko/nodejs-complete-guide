const { Schema, model } = require('mongoose');

const userSchema = new Schema({
  name: {
    type: String,
    required: true
  },
  email: {
    type: String,
    required: true
  },
  cart: {
    items: [
      {
        product: {
          type: Schema.Types.ObjectId,
          ref: 'Product',
          required: true
        },
        quantity: {
          type: Number,
          required: true
        }
      }
    ]
  }
});

userSchema.methods.addToCart = function (product) {
  const cartProductIndex = this.cart.items.findIndex(
    cartProduct => cartProduct.product.toString() === product._id.toString()
  );
  const updatedCartItems = [...this.cart.items];
  let newQuantity = 1;

  if (cartProductIndex === -1) {
    updatedCartItems.push({
      product: product._id,
      quantity: newQuantity
    });
  } else {
    newQuantity = this.cart.items[cartProductIndex].quantity + 1;
    updatedCartItems[cartProductIndex].quantity = newQuantity;
  }

  const updatedCart = {
    items: updatedCartItems
  };

  this.cart = updatedCart;

  return this.save();
};

userSchema.methods.deleteItemFromCart = function (id) {
  const updatedCartItems = this.cart.items.filter(
    cartItem => cartItem.product.toString() !== id
  );

  this.cart.items = updatedCartItems;

  return this.save();
};

userSchema.methods.clearCart = function () {
  this.cart = { items: [] };

  return this.save();
};

module.exports = model('User', userSchema);
