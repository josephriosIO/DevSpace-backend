const express = require("express");
// intitalize router
const router = express.Router();
const { check, validationResult } = require("express-validator/check");
const auth = require("../../middleware/auth");
//models
const Post = require("../../models/Post");
const Profile = require("../../models/Profile");
const User = require("../../models/User");

//Route POSR api/posts
//@desc create a post
//@access private
router.post(
  "/",
  [auth],
  [
    check("text", "Text is required")
      .not()
      .isEmpty()
  ],
  async (req, res) => {
    const errors = validationResult(req);
    if (!errors.isEmpty()) {
      return res.status(400).json({ message: errors.array() });
    }

    try {
      const user = await User.findById(req.user.id).select("-password");

      const newPost = new Post({
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      });

      const post = await newPost.save();

      res.json(post);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

//Route GEt api/posts
//@desc get  all post
//@access private
router.get("/", auth, async (req, res) => {
  try {
    const posts = await Post.find().sort({ date: -1 });
    res.json(posts);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
});

//Route GEt api/posts/:id
//@desc get  post by id
//@access private
router.get("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "post not found." });
    }
    res.json(post);
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "post not found." });
    }
    res.status(500).json({ message: err.message });
  }
});

//Route Delete api/posts/:id
//@desc delete a post
//@access private
router.delete("/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);
    if (!post) {
      return res.status(404).json({ message: "post not found." });
    }

    //check if user owns post
    if (post.user.toString() !== req.user.id) {
      return res.status(401).json({ message: "user doesnt own post" });
    }

    await post.remove();

    res.json({ message: "post was removed" });
  } catch (err) {
    if (err.kind === "ObjectId") {
      return res.status(404).json({ message: "post not found." });
    }
    res.status(500).json({ message: err.message });
  }
});

module.exports = router;
