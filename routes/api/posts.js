const express = require("express");

// intitalize router
const router = express.Router();

//Route GET api/posts/test
//@desc tests post route
//@access public
router.get("/test", (req, res) => {
  res.json({ msg: "posts works" });
});

module.exports = router;
