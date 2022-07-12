var express = require("express");
var router = express.Router();

const {
  getProductById,
  createProduct,
  getProduct,
  photo,
  updateProduct,
  removeProduct,
  getAllProducts,
  getAllUniqueCategories,
} = require("../controllers/product");
const { isSignedIn, isAuthenticated, isAdmin } = require("../controllers/auth");
const { getUserById } = require("../controllers/user");

//params
router.param("userId", getUserById);
router.param("productId", getProductById);

/*routes*/

//creation
router.post(
  "/product/create/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  createProduct
);

//accessing
//item_listig route
router.get("/products", getAllProducts);
//get single product by ID
router.get("/product/:productId", getProduct);
router.get("/product/photo/:productId", photo);

//updation
router.put(
  "/product/:productId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  updateProduct
);

//deletion
router.delete(
  "/product/:productId/:userId",
  isSignedIn,
  isAuthenticated,
  isAdmin,
  removeProduct
);

//item_listig route
//router.get("/products", getAllProducts);

//listing distinct categories
router.get("/products/categories", getAllUniqueCategories);

module.exports = router;
