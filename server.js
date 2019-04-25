const express = require("express");

const server = express();

server.use(express.json());

server.get("/", (req, res) => {
  res.send(`
    <h4>running</h4>
    `);
});

module.exports = server;
