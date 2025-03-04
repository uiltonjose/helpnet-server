const osController = require("../../controller/osController");
const express = require("express");
const router = express.Router();
const { handleResult, validateToken } = require("../../utils/APIUtil");

router.get("/listSituations", (req, res) => {
  validateToken(req, res);

  osController.listAllSituationOS().then(result => {
    handleResult(result, res);
  });
});

router.get("/listByProviderId", (req, res) => {
  validateToken(req, res);

  const providerId = req.query.providerId;
  osController.listOsByProviderId(providerId).then(result => {
    handleResult(result, res);
  });
});

router.get("/listBySituation", (req, res) => {
  validateToken(req, res);

  const providerId = req.query.providerId;
  const situationId = req.query.situationId;
  osController
    .listOsByProviderIdAndSituationId(providerId, situationId)
    .then(result => {
      handleResult(result, res);
    });
});

router.get("/listOsByProviderIdAndSituationOpened", (req, res) => {
  validateToken(req, res);

  const providerId = req.query.providerId;
  osController.listOsByProviderIdAndSituationOpened(providerId).then(result => {
    handleResult(result, res);
  });
});

router.get("/listOsByProviderIdAndSituationClosed", (req, res) => {
  validateToken(req, res);

  const providerId = req.query.providerId;
  osController.listOsByProviderIdAndSituationClosed(providerId).then(result => {
    handleResult(result, res);
  });
});

router.get("/listOsByProviderIdAndInProgress", (req, res) => {
  validateToken(req, res);

  const providerId = req.query.providerId;
  osController.listOsByProviderIdAndInProgress(providerId).then(result => {
    handleResult(result, res);
  });
});

router.get("/listByCustomer", (req, res) => {
  validateToken(req, res);

  const providerId = req.query.providerId;
  const customerId = req.query.customerId;
  osController
    .listOsByProviderIdAndCustomerId(providerId, customerId)
    .then(result => {
      handleResult(result, res);
    });
});

router.post("/register", (req, res) => {
  validateToken(req, res);

  const os = req.body;
  osController.registerOS(os).then(result => {
    handleResult(result, res);
  });
});

router.get("/canOpen", (req, res) => {
  validateToken(req, res);

  const providerId = req.query.providerId;
  const customerId = req.query.customerId;
  osController.canOpen(providerId, customerId).then(result => {
    handleResult(result, res);
  });
});

router.post("/changeSituation", (req, res) => {
  validateToken(req, res);

  const object = req.body;
  osController.changeSituationOS(object).then(result => {
    handleResult(result, res);
  });
});

router.post("/associateUser", (req, res) => {
  validateToken(req, res);

  const os = req.body;
  osController.associateUserWithOs(os).then(result => {
    handleResult(result, res);
  });
});

router.get("/getOsByNumber", (req, res) => {
  validateToken(req, res);

  const numberOS = req.query.numberOS;
  osController.getOsByNumber(numberOS).then(result => {
    handleResult(result, res);
  });
});

module.exports = router;
