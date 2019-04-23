const synchronizeController = require("../../controller/synchronizeController");
const express = require("express");
const router = express.Router();

router.get("/synchronizeCustomersWithProviders", (req, res) => {
  synchronizeController.synchronizeCustomersWithProviders().then(result => {
    res.json(result);
  });
});

router.get("/startSynchronizeFile", (req, res) => {
  synchronizeController.syncCustomersFromFiles().then(result => {
    res.json(result);
  });
});

router.get("/syncronizedCustomersFromFile", (req, res) => {
  const providerId = req.query.providerId;
  const result = synchronizeController.synchronizeCustomersFromFile(providerId);
  res.json(result);
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
