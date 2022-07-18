const Product = require("../models/product");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");
const { sortBy } = require("lodash");
const { updateOne } = require("../models/product");

exports.getProductById = (req, res, next, id) => {
  Product.findById(id)
    .populate("category")
    .exec((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "no product found",
        });
      }
      req.product = product;
      next();
    });
};

exports.createProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "Problematic file",
      });
    }
    //destructuring the fields
    const { name, description, price, category, stock } = fields;
    if (!name || !description || !price || !category || !stock) {
      return res.status(400).json({
        error: "One or more fields missing",
      });
    }

    //restrictions on field
    let product = new Product(fields);

    //file handling
    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({
          error: "File too large",
        });
      }
      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }

    //console.log(product);

    product.save((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "unable to save product",
        });
      }
      res.json({ product });
    });
  });
};

exports.getProduct = (req, res) => {
  req.product.photo = undefined;
  return res.json(req.product);
};

//middleware
exports.photo = (req, res, next) => {
  if (req.product.photo.data) {
    res.set("Content-Type", req.product.photo.contentType);
    return res.send(req.product.photo.data);
  }
  next();
};

exports.updateProduct = (req, res) => {
  let form = new formidable.IncomingForm();
  form.keepExtensions = true;
  form.parse(req, (err, fields, file) => {
    if (err) {
      return res.status(400).json({
        error: "Problematic file",
      });
    }

    //core updation code
    let product = req.product;
    product = _.extend(product, fields); //extend gets the fields of the current object

    //file handling
    if (file.photo) {
      if (file.photo.size > 3000000) {
        return res.status(400).json({
          error: "File too large",
        });
      }
      product.photo.data = fs.readFileSync(file.photo.path);
      product.photo.contentType = file.photo.type;
    }

    //console.log(product);

    product.save((err, product) => {
      if (err) {
        return res.status(400).json({
          error: "unable to update product",
        });
      }
      res.json({ product });
    });
  });
};

exports.removeProduct = (req, res) => {
  const product = req.product;

  product.remove((err, deletedProduct) => {
    if (err) {
      return res.status(400).json({
        error: "unable to remove",
      });
    }
    res.json({
      message: "Deletion succesful",
      deletedProduct,
    });
  });
};

exports.getAllProducts = (req, res) => {
  let limit = req.query.limit ? parseInt(req.query.limit) : 8; //input from user is alws taken in string thus parseInt
  let sortBy = req.query.sortBy ? req.query.sortBy : "_id";

  Product.find()
    .select("-photo")
    .populate("category")
    .sort([[sortBy, "asc"]])
    .limit(limit)
    .exec((err, products) => {
      if (err) {
        return res.status(400).json({
          error: "no product found",
        });
      }
      res.json(products);
    });
};

exports.getAllUniqueCategories = (req, res) => {
  Product.distinct("category", {}, (err, category) => {
    if (err) {
      return res.status(403).json({
        error: "no category fetched",
      });
    }
    res.json(category);
  });
};

//stock updation
exports.updateStock = (req, res) => {
  let myOpertaions = req.body.order.products.map((product) => {
    return {
      updateOne: {
        filter: { _id: product._id },
        update: { $inc: { stock: -product.count, sold: +product.count } },
      },
    };
  });

  Product.bulkWrite(myOpertaions, {}, (err, products) => {
    if (err) {
      return res.status(400).json({
        error: "Bulk Operation Failed",
      });
    }
    next();
  });
};
