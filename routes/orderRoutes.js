const express = require('express');
const router = express.Router();
const catchAsync = require('../utils/catchAsync');
const orders = require('../controllers/orderControllers');

const {
  validateClientOrder,
  IsOrderDetailVendor,
  isLoggedIn
} = require('../middleware');


router.post('/',
  isLoggedIn,
  validateClientOrder,
  catchAsync(orders.createOrder));

router.get('/profile/:id', catchAsync(orders.getTransactionHistory));

router.get('/shop/:id', catchAsync(orders.getShopOrders));

router.put('/shop/:id/fulfill',
  IsOrderDetailVendor,
  catchAsync(orders.fulfillOrder));

module.exports = router;