const userController = require("../../controller/userController");
const customerController = require("../../controller/customerController");
const express = require("express");
const router = express.Router();
const { handleResult } = require("../../utils/APIUtil");
const encryptUtil = require("../../utils/EncryptUtil");

router.get("/users", (req, res) => {
  userController.listAllUsers(result => {
    handleResult(result, res);
  });
});

router.get("/loadBaseCustomerFromProvider", (req, res) => {
  const providerID = req.query.providerID;
  customerController.loadBaseCustomerFromProvider(providerID, result => {
    handleResult(result, res);
  });
});

router.get("/synchronizeCustomersWithProviders", (req, res) => {
  customerController.synchronizeCustomersWithProviders(result => {
    handleResult(result, res);
  });
});

router.get("/encrypt", (req, res) => {
  const value = req.query.valueToEncrypt;
  const result = encryptUtil.encryptString(value);
  res.json(result);
});

router.get("/decrypt", (req, res) => {
  const cipher = req.query.cipher;
  const result = encryptUtil.decryptString(cipher);
  res.json(result);
});

module.exports = router;
