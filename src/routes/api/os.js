const osController = require("../../controller/osController");
const express = require("express");
const router = express.Router();

router.get("/listSituations", (req, res) => {
  osController.listAllSituationOS(result => {
    handleResult(result, res);
  });
});

router.get("/listByProviderId", (req, res) => {
  const providerId = req.query.providerId;
  osController.listOssByProviderId(providerId, result => {
    handleResult(result, res);
  });
});

router.get("/listBySituation", (req, res) => {
  const providerId = req.query.providerId;
  const situationId = req.query.situationId;
  osController.listOssByProviderIdAndSituationId(
    providerId,
    situationId,
    result => {
      handleResult(result, res);
    }
  );
});

router.get("/listByCustomer", (req, res) => {
  const providerId = req.query.providerId;
  const customerId = req.query.customerId;
  osController.listOssByProviderIdAndCustomerId(
    providerId,
    customerId,
    result => {
      handleResult(result, res);
    }
  );
});

router.post("/register", (req, res) => {
  const os = req.body;
  osController.registerOS(os, result => {
    handleResult(result, res);
  });
});

router.get("/canOpen", (req, res) => {
  const providerId = req.query.providerId;
  const customerId = req.query.customerId;
  osController.canOpen(providerId, customerId, result => {
    handleResult(result, res);
  });
});

router.post("/changeSituation", (req, res) => {
  const object = req.body;
  osController.changeSituationOS(object, result => {
    handleResult(result, res);
  });
});

router.post("/associateUser", (req, res) => {
  const os = req.body;
  osController.associateUserWithOs(os, result => {
    handleResult(result, res);
  });
});

const handleResult = (result, res) => {
  res.status(result.code).send(JSON.stringify(result));
};

module.exports = router;
