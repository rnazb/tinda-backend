const express = require('express');
const router = express.Router({ mergeParams: true });
const reviews = require('../controllers/reviewControllers');
const catchAsync = require('../utils/catchAsync');

const {
  validateClientReview,
  isReviewAuthor,
  isLoggedIn
} = require('../middleware');

router.post('/',
  isLoggedIn,
  validateClientReview,
  catchAsync(reviews.createReview));

router.delete('/:reviewId',
  isReviewAuthor,
  catchAsync(reviews.deleteReview));

module.exports = router;