const providerController = require("../../controller/providerController");
const express = require("express");
const router = express.Router();
const { handleResult } = require("../../utils/APIUtil");

router.get("/listProviders", (req, res) => {
  providerController.listAllProviders.then(result => {
    handleResult(result, res);
  });
});

router.put("/updateProvider", (req, res) => {
  const provider = req.body;
  providerController.updateProvider.then(provider, result => {
    handleResult(result, res);
  });
});

router.post("/addProvider", (req, res) => {
  const provider = req.body;
  providerController.addProvider.then(provider, result => {
    handleResult(result, res);
  });
});

module.exports = router;
