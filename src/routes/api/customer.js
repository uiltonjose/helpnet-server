const customerController = require("../../controller/customerController");
const express = require("express");
const router = express.Router();

const handleResult = (result, res) => {
  res.status(result.code).send(JSON.stringify(result));
};

router.get("/getProviderByCustomerIdAndProviderCode", (req, res) => {
  const cpfCustomer = req.query.cpfCustomer;
  const providerCod = req.query.providerCod;
  customerController.getProviderByCustomerCpfCnpjAndProviderCod(
    cpfCustomer,
    providerCod,
    result => {
      let respCode = result.code;
      if (respCode === undefined) {
        result.code = 200;
      }
      handleResult(result, res);
    }
  );
});

router.get("/getProviderByCustomerID", (req, res) => {
  const cpfCustomer = req.query.cpfCustomer;
  const providerCod = req.query.providerCod;
  customerController.getProviderByCustomerCpfCnpjAndProviderCod(
    cpfCustomer,
    providerCod,
    result => {
      let respCode = result.code;
      if (respCode === undefined) {
        result.code = 200;
      }
      handleResult(result, res);
    }
  );
});

router.get("/listByProviderId", (req, res) => {
  const providerId = req.query.providerId;
  customerController.listCustomersByProviderId(providerId, result => {
    handleResult(result, res);
  });
});

module.exports = router;
