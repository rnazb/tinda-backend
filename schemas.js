const Joi = require('joi');

module.exports.productSchema = Joi.object({
  name: Joi.string().required(),
  price: Joi.number().min(0).required(),
  description: Joi.string().required(),
}).required();

module.exports.orderSchema = Joi.array().items({
  id: Joi.string().required(),
  amount: Joi.number().min(1).required()
}).required();

module.exports.reviewSchema = Joi.object({
  authorId: Joi.string(),
  reviewedProductId: Joi.string(),
  rating: Joi.number().min(0).max(5).required(),
  reviewBody: Joi.string().required()
}).required();