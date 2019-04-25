const express = require("express");

// intitalize router
const router = express.Router();

//Route GET api/users/test
//@desc tests users route
//@access public
router.get("/test", (req, res) => {
  res.json({ msg: "users works" });
});

module.exports = router;
