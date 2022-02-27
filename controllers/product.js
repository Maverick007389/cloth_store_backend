const Product = require("../models/product");
const formidable = require("formidable");
const _ = require("lodash");
const fs = require("fs");

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
