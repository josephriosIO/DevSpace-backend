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
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ errors: errors.array() });
    }

    const { name, email, password } = req.body;
    try {
      let user = await User.findOne({ email });

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
      user = new User({
        name,
        email,
        avatar,
        password
      });

      const salt = await bcrypt.genSalt(10);

      user.password = await bcrypt.hash(password, salt);

      await user.save();

      const payload = {
        user: {
          id: user.id
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

module.exports = router;
