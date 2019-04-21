const userController = require("../../controller/userController");
const customerController = require("../../controller/customerController");
const express = require("express");
const router = express.Router();
const { handleResult } = require("../../utils/APIUtil");
const encryptUtil = require("../../utils/EncryptUtil");

router.get("/users", (req, res) => {
  userController.listAllUsers().then(result => {
    handleResult(result, res);
  });
});

router.get("/customers", (req, res) => {
  customerController.listAllCustomers().then(result => {
    handleResult(result, res);
  });
});

router.get("/loadBaseCustomerFromProvider", (req, res) => {
  const providerID = req.query.providerID;
  customerController.loadBaseCustomerFromProvider(providerID).then(result => {
    res.json(result);
  });
});

router.get("/synchronizeCustomersWithProviders", (req, res) => {
  customerController.synchronizeCustomersWithProviders().then(result => {
    res.json(result);
  });
});

router.get("/startSynchronizeFile", (req, res) => {
  customerController.loadCustomersFromFiles().then(result => {
    res.json(result);
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
