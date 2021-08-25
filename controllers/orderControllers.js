const Order = require('../models/order');
const OrderDetail = require('../models/orderDetail');
const Product = require('../models/product');
const User = require('../models/user');

module.exports.createOrder = async (req, res, next) => {
  try {
    const buyer = req.user._id;

    function LineItem(product, quantity, customer) {
      this.product = product;
      this.quantity = quantity;
      this.customer = customer;
    };

    const products = req.body;
    let totalOrderPrice = 0;
    const order = new Order({
      owner: req.user._id
    });

    // Create separate orderDetails to send to respective vendors

    for (let elem in products) {
      const product = products[elem].id;
      const quantity = products[elem].amount;

      const lineItem = new LineItem(product, quantity, buyer);
      const orderDetail = new OrderDetail(lineItem);

      const findVendor = await Product.findById(lineItem.product);
      const vendor = await User.findById(findVendor.owner._id);

      orderDetail.vendor = vendor._id;
      orderDetail.associatedOrder = order._id;

      if (orderDetail.quantity > 0) {
        await orderDetail.save();
        order.orderDetails.push(orderDetail._id);
      }

      // Calculate line item total and overall order total

      let orderDetailPrice = 0;
      const lineItemReference = await Product.findById(product);

      orderDetailPrice = quantity * lineItemReference.price;
      totalOrderPrice += orderDetailPrice;
    }

    order.totalAmount = totalOrderPrice;
    await order.save();

    res.send('Order placed');

  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};

module.exports.getTransactionHistory = async (req, res) => {
  try {
    const user = req.user._id;
    const orders = await Order.find({ owner: { $in: user } }).populate({
      path: 'orderDetails',
      populate: {
        path: 'product vendor'
      }
    });
    res.send(orders);

  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};

module.exports.getShopOrders = async (req, res) => {
  try {
    const vendor = req.user._id;
    const orders = await OrderDetail.find({
      vendor: { $in: vendor }
    })
      .populate({
        path: 'product'
      })
      .populate({
        path: 'customer'
      })
    res.send(orders);

  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};

module.exports.fulfillOrder = async (req, res, next) => {
  try {
    const { orderDetailId } = req.body;
    const orderDetail = await OrderDetail.findByIdAndUpdate(orderDetailId, { status: 'Completed' });
    await orderDetail.save();

    const product = await Product.findById(orderDetail.product);
    product.sales += orderDetail.quantity;
    product.revenue += orderDetail.quantity * product.price;
    await product.save();

    res.send('Order fulfilled');

  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};