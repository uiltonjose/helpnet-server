const synchronizeController = require("../../controller/synchronizeController");
const express = require("express");
const router = express.Router();
const { handleResult, validateToken } = require("../../utils/APIUtil");
const StatusCode = require("../../utils/StatusCode");

router.get("/synchronizeCustomersWithProviders", (req, res) => {
  synchronizeController.synchronizeCustomersWithProviders().then(result => {
    res.json(result);
  });
});

router.get("/syncronizedCustomersFromFile", (req, res) => {
  validateToken(req, res);

  const providerId = req.query.providerId;
  synchronizeController
    .synchronizeCustomersFromFile(providerId)
    .then(result => {
      handleResult(result, res);
    });
});

router.get("/loadBaseCustomerFromProvider", (req, res) => {
  const providerId = req.query.providerId;
  synchronizeController
    .loadBaseCustomerFromProvider(providerId)
    .then(result => {
      res.json(result);
    });
});

module.exports = router;
