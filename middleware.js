const {
  productSchema,
  orderSchema,
  reviewSchema
} = require('./schemas.js');

const ExpressError = require('./utils/ExpressError');
const Product = require('./models/product');
const Review = require('./models/review');
const OrderDetail = require('./models/orderDetail');

module.exports.isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    res.status(403).send('Please log in');
  } else {
    next();
  }
}

module.exports.validateClientProduct = (req, res, next) => {
  const productDetails = JSON.parse(req.body.details);
  const { error } = productSchema.validate(productDetails);
  if (error) {
    const msg = error.details.map(elem => elem.message).join(',');
    console.error(error)
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.validateClientOrder = (req, res, next) => {
  const { error } = orderSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(elem => elem.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.validateClientReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map(elem => elem.message).join(',');
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};

module.exports.isProductOwner = async (req, res, next) => {
  const { id } = req.params;
  const product = await Product.findById(id);
  if (!product.owner.equals(req.user._id)) {
    res.status(403).send('Action not allowed');
  } else {
    next();
  }
};

module.exports.isReviewAuthor = async (req, res, next) => {
  const { reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    res.status(403).send('Action not allowed');
  } else {
    next();
  }
};

module.exports.IsOrderDetailVendor = async (req, res, next) => {
  const orderDetail = await OrderDetail.findById(req.body.orderDetailId);
  if (!orderDetail.vendor.equals(req.user._id)) {
    res.status(403).send('Action not allowed');
  } else {
    next();
  }
};