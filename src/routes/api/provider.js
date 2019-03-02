const providerController = require("../../controller/providerController");
const express = require("express");
const router = express.Router();

const handleResult = (result, res) => {
  res.status(result.code).send(JSON.stringify(result));
};

router.get("/listProviders", (req, res) => {
  providerController.listAllProviders(result => {
    handleResult(result, res);
  });
});

router.put("/updateProvider", (req, res) => {
  const provider = req.body;
  providerController.updateProvider(provider, result => {
    handleResult(result, res);
  });
});

router.post("/addProvider", (req, res) => {
  const provider = req.body;
  providerController.addProvider(provider, result => {
    handleResult(result, res);
  });
});

module.exports = router;
