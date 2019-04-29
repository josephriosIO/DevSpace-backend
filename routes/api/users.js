const express = require("express");
// intitalize router
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const keys = require("../../config/keys");
//load user model
const User = require("../../models/User");

//Route GET api/users/test
//@desc tests users route
//@access public
router.get("/test", (req, res) => {
  res.json({ msg: "users works" });
});

//Route GET api/users/register
//@desc register user
//@access public
router.post(
  "/register",
  [
    check("name", "name is required")
      .not()
      .isEmpty(),
    check("email", "please check email").isEmail(),
    check("password", "password needs to be 6 charcters long").isLength({
      min: 6
    })
  ],
  async (req, res) => {
    try {
      const errors = validationResult(req);
      if (!errors.isEmpty()) {
        return res.status(400).json({ errors: errors.array() });
      }
      const user = await User.findOne({ email: req.body.email });
      if (user) {
        return res.status(400).json({ email: "email already exist" });
      } else {
        const avatar = gravatar.url(req.body.email, {
          s: "200", //sizing
          r: "pg", // rating
          d: "mm" //discription
        });
        const newUser = new User({
          name: req.body.name,
          email: req.body.email,
          avatar,
          password: req.body.password
        });

        bcrypt.genSalt(10, (err, salt) => {
          bcrypt.hash(newUser.password, salt, (err, hash) => {
            if (err) throw err;
            newUser.password = hash;
            newUser
              .save()
              .then(user => res.json(user))
              .catch(err => console.log(err));
          });
        });
      }
    } catch (err) {
      res.status(500).json(err);
    }
  }
);

//Route GET api/users/login
//@desc login user / returning the token
//@access public
router.post("/login", async (req, res) => {
  try {
    const email = req.body.email;
    const password = req.body.password;

    //find user by email
    const user = await User.findOne({ email });
    //check for user
    if (!user) {
      return res.status(404).json({ email: "user email not found" });
    }
    // check password
    bcrypt.compare(password, user.password).then(isMatch => {
      if (isMatch) {
        // user matched
        const payload = { id: user.id, name: user.name, avatar: user.avatar }; //create jwt payload
        //sign token
        jwt.sign(payload, keys.secretKey, { expiresIn: 3600 }, (err, token) => {
          res.json({
            success: true,
            token: "Bearer " + token
          });
        });
      } else {
        return res.status(400).json({ password: "password incorrect" });
      }
    });
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
