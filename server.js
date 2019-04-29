const express = require("express");
const mongoose = require("mongoose");

//import routes
const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");

const server = express();

//db config
const db = require("./config/keys").mongoURI;

//connect to monoDB
mongoose
  .connect(db)
  .then(() => {
    console.log("mongoDB connected");
  })
  .catch(err => {
    console.log(err);
  });

server.use(express.json({ extended: false }));

server.get("/", (req, res) => {
  res.send(`
    <h4>running</h4>
    `);
});

//use routes
server.use("/api/users", users);
server.use("/api/posts", posts);
server.use("/api/profile", profile);

module.exports = server;
