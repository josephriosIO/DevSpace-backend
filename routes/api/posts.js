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

//Route put api/posts/like/:id
//@desc like a post
//@access private
router.put("/like/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //check if post has been liked
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length > 0
    ) {
      return res.status(400).json({ msg: "post already liked" });
    }

    post.likes.unshift({ user: req.user.id });
    await post.save();
    res.json(post.likes);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

//Route put api/posts/unlike/:id
//@desc remove a like
//@access private
router.put("/unlike/:id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //check if post has been liked
    if (
      post.likes.filter(like => like.user.toString() === req.user.id).length ===
      0
    ) {
      return res.status(400).json({ msg: "post has not been liked" });
    }

    //get remove index
    const removeIndex = post.likes
      .map(like => like.user.toString())
      .indexOf(req.user.id);

    post.likes.splice(removeIndex, 1);

    await post.save();
    res.json(post.likes);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

//Route POST api/posts/comment/:id
//@desc create a comment on a post
//@access private
router.post(
  "/comment/:id",
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

      const post = await Post.findById(req.params.id);

      const newComment = {
        text: req.body.text,
        name: user.name,
        avatar: user.avatar,
        user: req.user.id
      };

      post.comments.unshift(newComment);

      await post.save();

      res.json(post.comments);
    } catch (err) {
      res.status(500).json({ message: err.message });
    }
  }
);

//Route delete api/posts/comment/:id/:comment_id
//@desc delete comment on a post
//@access private
router.delete("/comment/:id/:comment_id", auth, async (req, res) => {
  try {
    const post = await Post.findById(req.params.id);

    //pull out comments
    const comment = post.comments.find(
      comment => comment.id === req.params.comment_id
    );

    //make sure comment exist
    if (!comment) {
      return res.status(404).json({ msg: "comment not found" });
    }
    // make sure user is authizored to delete comment
    if (comment.user.toString() !== req.user.id) {
      return res.status(401).json({ msg: "user not authoizad" });
    }
    //get remove index
    const removeIdx = post.comments
      .map(comment => comment.user.toString())
      .indexOf(req.user.id);
    post.comments.splice(removeIdx, 1);

    await post.save();

    res.json(post.comments);
  } catch (err) {
    res.status(500).json({ msg: err.message });
  }
});

module.exports = router;
