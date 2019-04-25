const express = require("express");
// intitalize router
const router = express.Router();
const gravatar = require("gravatar");
const bcrypt = require("bcryptjs");
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
router.post("/register", async (req, res) => {
  try {
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
});

module.exports = router;
