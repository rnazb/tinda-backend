const mongoose = require('mongoose');
const Schema = mongoose.Schema;
const passportLocalMongoose = require('passport-local-mongoose');

const userSchema = new Schema({
  email: {
    type: String,
    required: [true, 'Email is required'],
    unique: true
  },
  role: {
    type: String,
    enum: ['customer', 'vendor', 'siteAdmin'],
    default: 'customer'
  }
}, { timestamps: true });

userSchema.plugin(passportLocalMongoose);

userSchema.post('save', function (err, doc, next) {
  if (err.name === 'MongoError' && err.code === 11000) {
    next(new Error('An account with this email already exists'));
  } else {
    next(err);
  }
});

module.exports = mongoose.model('User', userSchema);