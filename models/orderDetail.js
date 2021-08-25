const mongoose = require('mongoose');
const Product = require('./product');
const Order = require('./order');
const Schema = mongoose.Schema;

const orderDetailSchema = new Schema({
  associatedOrder: {
    type: Schema.Types.ObjectId,
    ref: 'Order'
  },
  product: {
    type: Schema.Types.ObjectId,
    ref: 'Product'
  },
  quantity: {
    type: Number,
    required: true,
    min: [1, 'Your order must contain at least 1 of this item to proceed']
  },
  status: {
    type: String,
    enum: ['Pending', 'Completed'],
    default: 'Pending'
  },
  customer: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  vendor: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  }
}, { timestamps: true });

module.exports = mongoose.model('OrderDetail', orderDetailSchema);