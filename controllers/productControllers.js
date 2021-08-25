const Product = require('../models/product');
const { cloudinary } = require('../cloudinary/index');


module.exports.getAllProducts = async (req, res) => {
  try {
    const products = await Product.find({}).populate('owner');
    res.send(products);

  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};


module.exports.getSingleProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id)
      .populate('owner')
      .populate({
        path: 'reviews',
        populate: {
          path: 'author'
        }
      });
    res.send(product);

  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};


module.exports.getShopProducts = async (req, res) => {
  try {
    const { shopId } = req.params;
    const products = await Product.find({ owner: shopId }).populate('owner');
    res.send(products);

  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};


module.exports.getAverageSellerRating = async (req, res) => {
  try {
    const { shopId } = req.params;
    const products = await Product.find({ owner: shopId });

    const ratings = [];
    for (let index in products) {
      ratings.push(products[index].averageRating);
    };

    const reducer = (accumulator, currentValue) => accumulator + currentValue;
    const averageAllRatings = ratings.reduce(reducer) / ratings.length;
    const convertToPercentage = averageAllRatings * 20;

    res.send({
      averageSellerRating: convertToPercentage
    });

  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};


module.exports.addProduct = async (req, res) => {
  try {
    const productDetails = JSON.parse(req.body.details);
    const product = new Product(productDetails);

    product.images = req.files.map(file => ({
      url: file.path,
      filename: file.filename
    }));
    product.owner = req.user._id;

    await product.save();
    res.send('Successfully added new product');

  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};


module.exports.editProduct = async (req, res) => {
  try {
    const { id } = req.params;
    await Product.findByIdAndUpdate(id, { ...req.body }, { new: true });
    res.send('Successfully edited product');

  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};


module.exports.deleteProduct = async (req, res) => {
  try {
    const { id } = req.params;
    const product = await Product.findById(id);
    const imagesToDelete = product.images;

    for (let index in imagesToDelete) {
      await cloudinary.uploader.destroy(imagesToDelete[index].filename);
    }

    await Product.findByIdAndDelete(id);
    res.send('Successfully deleted product');

  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};


module.exports.addProductImages = async (req, res) => {
  try {
    const productId = JSON.parse(req.body.productId);
    const product = await Product.findById(productId);
    const newImages = req.files.map(file => ({
      url: file.path,
      filename: file.filename
    }));

    for (let index in newImages) {
      product.images.push(newImages[index]);
    }

    await product.save();
    res.send('Sucessfully added images');

  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};


module.exports.deleteProductImages = async (req, res) => {
  try {
    const imagesToDelete = req.body.data;
    const product = await Product.findById(req.body.productId);

    for (let index in imagesToDelete) {
      const imageIndex = product.images.findIndex(
        item => item.filename === imagesToDelete[index]
      );

      product.images.splice(imageIndex, 1);
      await cloudinary.uploader.destroy(imagesToDelete[index]);
    }

    await product.save();
    res.send('Sucessfully delete images');

  } catch (err) {
    console.error(err);
    res.status(500).send('Something went wrong');
  }
};