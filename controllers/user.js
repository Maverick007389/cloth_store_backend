const User = require("../models/user");
const Order = require("../models/order");

exports.getUserById = (req, res, next, id) => {
  User.findById(id).exec((err, user) => {
    if (err || !user) {
      return res.status(400).json({
        error: "no user found",
      });
    }
    req.profile = user;
    next();
  });
};

exports.getUser = (req, res) => {
  //making these values undefined in the user profile, not in the database
  req.profile.salt = undefined;
  req.profile.encrypted_password = undefined;
  return res.json(req.profile);
};

exports.updateUser = (req, res) => {
  User.findByIdAndUpdate(
    { _id: req.profile._id },
    { $set: req.body },
    { new: true, useFindAndModify: false }
  ).exec((err, user) => {
    if (err) {
      return res.status(400).json({
        error: "Unable to update",
      });
    }
    user.salt = undefined;
    user.encrypted_password = undefined;
    res.json(user);
  });
};

exports.userPurchaseList = (req, res) => {
  Order.find({ user: req.profile._id })
    .populate("user", "_id name") //used when referencing documents in other collection
    .exec((err, user) => {
      if (err) {
        return res.status(400).json({
          error: "No order",
        });
      }
      return res.json(order);
    });
};

exports.pushOrderInPurchaseList = (req, res, next) => {
  let purchases = [];
  req.body.order.products.forEach((product) => {
    purchases.push({
      _id: product._id,
      name: product.name,
      description: product.description,
      category: product.category,
      quantity: product.quantity,
      amount: req.body.order.amount,
      transaction_id: req.body.order.transaction_id,
    });
  });

  //store thi in DB
  User.findOneAndUpdate(
    { _id: req.profile._id },
    { $push: { purchases: purchases } },
    { new: true },
    (err, purchases) => {
      if (err) {
        return res.status(400).json({
          error: "Unable to save purchase list",
        });
      }
      next();
    }
  );
};

/*exports.allusers = (req, res) => {
    User.find().exec((err, user) => {
        if(err||!user){
            return res.status(400).json({
                error: "no user found"
            })
        }
        res.json(user);
    })
}*/
