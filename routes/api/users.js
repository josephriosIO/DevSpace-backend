const express = require("express");
// intitalize router
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const config = require("config");

//load user model
const User = require("../../models/User");

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
      const { name, email, password } = req.body;
      const user = await User.findOne({ email });

      if (user) {
        return res
          .status(400)
          .json({ errors: [{ msg: "User already exists" }] });
      }

      const avatar = gravatar.url(email, {
        s: "200", //sizing
        r: "pg", // rating
        d: "mm" //discription
      });
      const newUser = new User({
        name,
        email,
        avatar,
        password
      });

      const salt = await bcrypt.genSalt(10);

      newUser.password = await bcrypt.hash(password, salt);

      await newUser.save();

      const payload = {
        user: {
          id: newUser.id
        }
      };

      jwt.sign(
        payload,
        config.get("secretKey"),
        { expiresIn: 460000 },
        (err, token) => {
          if (err) throw err;
          res.json({ token });
        }
      );
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
