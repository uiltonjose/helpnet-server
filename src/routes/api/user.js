const userController = require("../../controller/userController");
const express = require("express");
const router = express.Router();
const { handleResult } = require("../../utils/APIUtil");

router.post("/add", (req, res) => {
  const userObj = req.body;
  userController.addUser(userObj).then(result => {
    handleResult(result, res);
  });
});

router.put("/activateUserWithProvider", (req, res) => {
  const userObj = req.body;
  userController.activateUserWithProvider(userObj).then(result => {
    handleResult(result, res);
  });
});

/*
// This API lists all users that can be associated with an OS
*/
router.get("/listByProviderId", (req, res) => {
  const providerId = req.query.providerId;
  userController.listUserByProviderId(providerId).then(result => {
    handleResult(result, res);
  });
});

router.get("/info", (req, res) => {
  const userLogin = req.query.userLogin;
  userController.getUserInfo(userLogin).then(result => {
    handleResult(result, res);
  });
});

module.exports = router;
