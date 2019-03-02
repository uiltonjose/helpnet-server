const userController = require("../../controller/userController");
const express = require("express");
const router = express.Router();

const handleResult = (result, res) => {
  res.status(result.code).send(JSON.stringify(result));
};

router.post("/add", (req, res) => {
  const userObj = req.body;
  userController.addUser(userObj, result => {
    handleResult(result, res);
  });
});

router.put("/activateUserWithProvider", (req, res) => {
  const userObj = req.body;
  userController.activateUserWithProvider(userObj, result => {
    handleResult(result, res);
  });
});

router.get("/info", (req, res) => {
  const userLogin = req.query.userLogin;
  userController.getUserInfo(userLogin, result => {
    handleResult(result, res);
  });
});

module.exports = router;
