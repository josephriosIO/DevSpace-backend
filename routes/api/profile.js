const express = require("express");
const auth = require("../../middleware/auth");
const Profile = require("../../models/Profile");
const User = require("../../models/User");

// intitalize router
const router = express.Router();

//Route GET api/profile/me
//@desc get cur users profile
//@access private
router.get("/me", auth, async (req, res) => {
  try {
    const profile = await Profile.findOne({ user: req.user.id }).populate(
      "user",
      ["name", "avatar"]
    );

    if (!profile) {
      return res.status(400).json({ message: "no profile for this user" });
    }

    res.json(profile);
  } catch (err) {
    res.status(500).json(err);
  }
});

module.exports = router;
