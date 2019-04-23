const express = require("express"),
  bodyParser = require("body-parser"),
  app = (module.exports = express()),
  path = require("path"),
  cookieParser = require("cookie-parser"),
  logger = require("morgan"),
  cors = require("cors");

require("dotenv").config();

app.use(cors());
app.use(function(req, res, next) {
  res.header("Access-Control-Allow-Origin", "*");
  res.header("Access-Control-Allow-Methods", "GET,PUT,POST,DELETE");
  res.header(
    "Access-Control-Allow-Headers",
    "Origin, X-Requested-With, Content-Type, Accept"
  );
  res.header("Access-Control-Allow-Credentials", "true");
  next();
});

app.use(bodyParser.json()); // to support JSON-encoded bodies
app.use(
  bodyParser.urlencoded({
    // to support URL-encoded bodies
    extended: true
  })
);

app.use(logger("dev"));
app.use(cookieParser());

const server = app.listen(process.env.PORT || 4000, function() {
  console.log("Server is Up -  Let's go!");
});
server.timeout = 2000;
