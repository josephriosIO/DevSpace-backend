const express = require("express");

// intitalize router
const router = express.Router();

//Route GET api/profile/test
//@desc tests profile route
//@access public
router.get("/test", (req, res) => {
  res.json({ msg: "profile works" });
});

module.exports = router;
