const customerController = require("../../controller/customerController");
const express = require("express");
const router = express.Router();
const { handleResult } = require("../../utils/APIUtil");
const StatusCode = require("../../utils/StatusCode");

router.get("/getProviderByCustomerIdAndProviderCode", (req, res) => {
  const cpfCustomer = req.query.cpfCustomer;
  const providerCod = req.query.providerCod;
  customerController
    .getProviderByCustomerCpfCnpjAndProviderCod(cpfCustomer, providerCod)
    .then(result => {
      let respCode = result.code;
      if (respCode === undefined) {
        result.code = StatusCode.status.Ok;
      }
      handleResult(result, res);
    });
});

router.get("/getProviderByCustomerID", (req, res) => {
  const cpfCustomer = req.query.cpfCustomer;
  const providerCod = req.query.providerCod;
  customerController
    .getProviderByCustomerCpfCnpjAndProviderCod(cpfCustomer, providerCod)
    .then(result => {
      let respCode = result.code;
      if (respCode === undefined) {
        result.code = StatusCode.status.Ok;
      }
      handleResult(result, res);
    });
});

router.get("/listByProviderId", (req, res) => {
  const providerId = req.query.providerId;
  customerController.listCustomersByProviderId(providerId).then(result => {
    handleResult(result, res);
  });
});

module.exports = router;
