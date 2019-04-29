const express = require("express");
const connectDB = require("./config/db");

//import routes
const users = require("./routes/api/users");
const profile = require("./routes/api/profile");
const posts = require("./routes/api/posts");
const auth = require("./routes/api/auth");

const server = express();

//connect db
connectDB();

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
server.use("/api/auth", auth);

module.exports = server;
