const userController = require("../../controller/userController");
const customerController = require("../../controller/customerController");
const express = require("express");
const router = express.Router();

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

const handleResult = (result, res) => {
  res.status(result.code).send(JSON.stringify(result));
};

module.exports = router;
