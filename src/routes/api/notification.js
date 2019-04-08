const notificationController = require("../../controller/notificationController");
const express = require("express");
const router = express.Router();
const { handleResult } = require("../../utils/APIUtil");

router.post("/sendNotification", (req, res) => {
  const notificationObj = req.body;
  notificationController.createNotification(notificationObj).then(result => {
    handleResult(result, res);
  });
});

router.put("/updateNotificationAsRead", (req, res) => {
  const notificationId = req.body.notificationId;
  const customerId = req.body.customerId;
  notificationController
    .updateNotificationAsRead(notificationId, customerId)
    .then(result => {
      handleResult(result, res);
    });
});

router.get("/listByCustomerId", (req, res) => {
  const customerId = req.query.customerId;

  notificationController
    .listNotificationsByCustomerId(customerId)
    .then(result => {
      handleResult(result, res);
    });
});

router.get("/listByProviderId", (req, res) => {
  const providerId = req.query.providerId;
  notificationController
    .listNotificationsByProviderId(providerId)
    .then(result => {
      handleResult(result, res);
    });
});

router.get("/listDefaultMessageForNotification", (req, res) => {
  notificationController.listDefaultMessageForNotification().then(result => {
    handleResult(result, res);
  });
});

module.exports = router;
