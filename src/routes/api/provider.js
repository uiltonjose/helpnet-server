const providerController = require("../../controller/providerController");
const express = require("express");
const router = express.Router();
const { handleResult, validateToken } = require("../../utils/APIUtil");

router.get("/listProviders", (req, res) => {
  validateToken(req, res);

  providerController.listAllProviders().then(result => {
    handleResult(result, res);
  });
});

router.put("/updateProvider", (req, res) => {
  validateToken(req, res);

  const provider = req.body;
  providerController.updateProvider(provider).then(result => {
    handleResult(result, res);
  });
});

router.post("/addProvider", (req, res) => {
  validateToken(req, res);

  const provider = req.body;
  providerController.addProvider(provider).then(result => {
    handleResult(result, res);
  });
});

/**
 * Get provider by @param providerId.
 */
router.get("/", (req, res) => {
  validateToken(req, res);

  const providerId = req.query.providerId;
  providerController.getProviderById(providerId).then(result => {
    handleResult(result, res);
  });
});

module.exports = router;
