const express = require('express');
const router = express.Router();
const products = require('../controllers/productControllers');
const catchAsync = require('../utils/catchAsync');

const multer = require('multer');
const { storage } = require('../cloudinary');
const upload = multer({ storage });

const {
  validateClientProduct,
  isProductOwner,
  isLoggedIn
} = require('../middleware');

router.route('/')
  .get(catchAsync(products.getAllProducts))
  .post(
    isLoggedIn,
    upload.array('files'),
    validateClientProduct,
    catchAsync(products.addProduct));

router.route('/:id')
  .get(catchAsync(products.getSingleProduct))
  .put(
    isProductOwner,
    catchAsync(products.editProduct))
  .delete(
    isProductOwner,
    catchAsync(products.deleteProduct));

router.post('/:id/images/upload',
  isProductOwner,
  upload.array('files'),
  catchAsync(products.addProductImages));

router.delete('/:id/images/delete',
  isProductOwner,
  catchAsync(products.deleteProductImages));

router.get('/shop/:shopId', catchAsync(products.getShopProducts));

router.get('/shop/:shopId/averagerating', catchAsync(products.getAverageSellerRating));

module.exports = router;