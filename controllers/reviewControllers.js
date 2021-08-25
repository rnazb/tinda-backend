const Product = require('../models/product');
const Review = require('../models/review');

module.exports.createReview = async (req, res) => {
  try {
    const clientReview = {
      body: req.body.reviewBody,
      rating: req.body.rating,
      author: req.body.authorId
    };
    const reviewedProduct = req.body.reviewedProductId;

    const product = await Product.findById(reviewedProduct).populate('reviews');
    const review = new Review(clientReview);
    product.reviews.push(review);

    // Recalculate averageRating

    let currentAverage = product.averageRating;
    let calculateNewAverage = (review.rating - currentAverage) / product.reviews.length;

    product.averageRating = currentAverage + calculateNewAverage;

    await review.save();
    await product.save();

    res.send('Review successfully added');

  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};

module.exports.deleteReview = async (req, res) => {
  try {
    const { productId, reviewId } = req.params;

    const product = await Product.findById(productId).populate('reviews');
    const review = await Review.findById(reviewId);

    // Recalculate averageRating

    const currentAverage = product.averageRating;
    const currentTotal = currentAverage * product.reviews.length;
    const newTotal = currentTotal - review.rating;
    const newArrLength = product.reviews.length - 1;

    if (newArrLength > 0) {
      product.averageRating = newTotal / newArrLength;
    } else {
      product.averageRating = 0;
    }

    // Remove review reference from Product model

    const reviewIndex = product.reviews.findIndex((elem) => {
      return elem.id === reviewId;
    });
    product.reviews.splice(reviewIndex, 1);

    await product.save();
    await Review.findByIdAndDelete(reviewId);
    res.send('Review successfully deleted');

  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};