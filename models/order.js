const mongoose = require('mongoose');
const Product = require('./product');
const Schema = mongoose.Schema;

const orderSchema = new Schema({
  totalAmount: Number,
  purchasedOn: {
    type: Date,
    default: Date.now()
  },
  orderDetails: [
    {
      type: Schema.Types.ObjectId,
      ref: 'OrderDetail'
    }
  ],
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

const Order = mongoose.model('Order', orderSchema);

module.exports = Order;
