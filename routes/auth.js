var express = require("express");
var router = express.Router();
const { check, validationResult } = require("express-validator");

/*router.get('/signout', (req, res) => {
    res.send("User Signout")
});
const signout = (req, res) => {
    res.json({
        message : "User signout"
    });
};
router.get('/signout', signout);*/

const { signup, signin, signout, isSignedIn } = require("../controllers/auth");

router.post(
  "/signup",
  [
    check("name", "name should be at least 3 chars long").isLength({ min: 3 }),
    check("password", "password should be at least 3 chars long").isLength({
      min: 3,
    }),
    check("email", "email Required").isEmail(),
  ],
  signup
);

router.post(
  "/signin",
  [
    check("email", "email Required").isEmail(),
    check("password", "password is required").isLength({ min: 3 }),
  ],
  signin
);

router.get("/signout", signout);

router.get("/testroute", isSignedIn, (req, res) => {
  // res.send('A Protected route');
  res.send(req.auth);
});

module.exports = router;
