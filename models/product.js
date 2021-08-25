const mongoose = require('mongoose');
const Review = require('./review');
const Schema = mongoose.Schema;

const ImageSchema = new Schema({
  url: String,
  filename: String
});

const productSchema = new Schema({
  name: String,
  price: Number,
  description: String,
  images: [ImageSchema],
  dateAdded: {
    type: Date,
    default: Date.now()
  },
  owner: {
    type: Schema.Types.ObjectId,
    ref: 'User'
  },
  reviews: [
    {
      type: Schema.Types.ObjectId,
      ref: 'Review'
    }
  ],
  averageRating: {
    type: Number,
    default: 0,
    min: 0,
    max: 5
  },
  sales: {
    type: Number,
    default: 0
  },
  revenue: {
    type: Number,
    default: 0
  }
}, { timestamps: true });

// Middleware to delete associated reviews on product delete

productSchema.post('findOneAndDelete', async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews
      }
    })
  }
});

module.exports = mongoose.model('Product', productSchema);