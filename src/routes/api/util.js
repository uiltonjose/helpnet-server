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

router.get("/generateToken", (req, res) => {
  const authHeader = req.header("Authorization");
  const token = encryptUtil.generateAccessToken(authHeader);
  res.json(token);
});

router.get("/validateToken", (req, res) => {
  const authHeader = req.header("Authorization");
  const isValid = encryptUtil.isValidToken(authHeader);
  isValid.then(result => {
    res.json(result);
  });
});

module.exports = router;
