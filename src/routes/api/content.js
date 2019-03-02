const contentController = require("../../controller/contentController");
const express = require("express");
const router = express.Router();

router.get("/boot", (req, res) => {
  contentController.boot(result => {
    res.status(result.code).send(JSON.stringify(result));
  });
});

module.exports = router;
