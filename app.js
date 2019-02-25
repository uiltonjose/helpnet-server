const app = require("./src/app_config.js"),
  osController = require("./src/controller/osController"),
  customerController = require("./src/controller/customerController"),
  providerController = require("./src/controller/providerController"),
  contentController = require("./src/controller/contentController"),
  notificationController = require("./src/controller/notificationController"),
  userController = require("./src/controller/userController");
require("dotenv").load();

app.get("/", (req, res) => {
  res.json("HelpNet - Webservice alive! Ready to work.");
});
// Begin Content
app.get("/api/content/boot", (req, res) => {
  contentController.boot(result => {
    handleResult(result, res);
  });
});

/**
 * @deprecated Since version 1.1.0. Will be deleted in version 1.2.0. Use boot instead.
 */
app.get("/api/content/version", (req, res) => {
  contentController.deployVersion(function(result) {
    res.send(JSON.stringify(result));
  });
});

/**
 * @deprecated Since version 1.1.0. Will be deleted in version 1.2.0. Use boot instead.
 */
app.get("/api/content/listProblems", (req, res) => {
  osController.listProblems(function(err, result) {
    res.send(JSON.stringify(result));
  });
});
// End Content

// Begin Customer
app.get("/api/customer/getProviderByCustomerID", (req, res) => {
  const cpfCustomer = req.query.cpfCustomer;
  const providerCod = req.query.providerCod;
  customerController.getProviderByCustomerID(cpfCustomer, providerCod, function(
    result
  ) {
    let respCode = result.code;
    if (respCode === undefined) {
      result.code = 200;
    }
    handleResult(result, res);
  });
});

app.get("/api/customer/listByProviderId", (req, res) => {
  const providerId = req.query.providerId;
  customerController.listByProviderId(providerId, function(err, result) {
    res.send(JSON.stringify(result));
  });
});

app.get("/api/synchronizeCustomersWithProviders", (req, res) => {
  customerController.synchronizeCustomersWithProviders(function(err, result) {
    res.send(JSON.stringify(result));
  });
});
// End Customer

// Begin PROVIDER
app.get("/api/provider/listProviders", (req, res) => {
  providerController.listProviders(function(err, result) {
    res.send(JSON.stringify(result));
  });
});

app.put("/api/provider/updateProvider", (req, res) => {
  const provider = req.body;

  providerController.updateProvider(provider, function(result) {
    handleResult(result, res);
  });
});

app.post("/api/provider/addProvider", (req, res) => {
  const provider = req.body;
  providerController.addProvider(provider, function(result) {
    handleResult(result, res);
  });
});
// End PROVIDER

// Begin NOTIFICATION
app.post("/api/notification/sendNotification", (req, res) => {
  const notificationObj = req.body;

  notificationController.createNotification(notificationObj, result => {
    handleResult(result, res);
  });
});

app.put("/api/notification/status", (req, res) => {
  const notificationId = req.body.notificationId;
  const customerId = req.body.customerId;

  notificationController.updateNotification(
    notificationId,
    customerId,
    result => {
      handleResult(result, res);
    }
  );
});

app.get("/api/notification/listByCustomerId", (req, res) => {
  const customerId = req.query.customerId;

  notificationController.listByCustomerId(customerId, result => {
    handleResult(result, res);
  });
});

app.get("/api/notification/listByProviderId", (req, res) => {
  const providerId = req.query.providerId;

  notificationController.listByProviderId(providerId, result => {
    res.send(JSON.stringify(result));
  });
});

// End NOTIFICATION

// Begin USER
app.post("/api/user/add", (req, res) => {
  const userObj = req.body;

  userController.addUser(userObj, result => {
    handleResult(result, res);
  });
});

app.put("/api/user/updateStatus", (req, res) => {
  const userObj = req.body;

  userController.updateUserStatus(userObj, result => {
    handleResult(result, res);
  });
});

app.get("/api/user/info", (req, res) => {
  const userLogin = req.query.userLogin;

  userController.getUserInfo(userLogin, result => {
    handleResult(result, res);
  });
});

// End USER

// Begin OS
app.get("/api/os/listSituations", (req, res) => {
  osController.listSituations(function(err, result) {
    res.send(JSON.stringify(result));
  });
});

app.get("/api/os/listByProviderId", (req, res) => {
  const providerId = req.query.providerId;
  osController.listOSByProvider(providerId, function(err, result) {
    res.send(JSON.stringify(result));
  });
});

app.get("/api/os/listBySituation", (req, res) => {
  const providerId = req.query.providerId;
  const situationId = req.query.situationId;
  osController.listOSBySituation(providerId, situationId, function(
    err,
    result
  ) {
    res.send(JSON.stringify(result));
  });
});

app.get("/api/os/listByCustomer", (req, res) => {
  const providerId = req.query.providerId;
  const customerId = req.query.customerId;
  osController.listOSByCustomer(providerId, customerId, function(err, result) {
    res.send(JSON.stringify(result));
  });
});

app.post("/api/os/register", (req, res) => {
  const os = req.body;
  osController.registerOS(os, function(err, result) {
    res.send(JSON.stringify(result));
  });
});

app.get("/api/os/canOpen", (req, res) => {
  const providerId = req.query.providerId;
  const customerId = req.query.customerId;

  osController.canOpen(providerId, customerId, result => {
    handleResult(result, res);
  });
});

app.post("/api/os/changeSituation", (req, res) => {
  const object = req.body;
  //  osController.changeSituationOS(object, function(err, result) {
  //    res.send(JSON.stringify(result));
  //  });
  res.send(JSON.stringify("PRECISA_SER_REVISADO!!"));
});

app.post("/api/os/associateTechnical", (req, res) => {
  const os = req.body;
  //osController.associateTechnical(os, function(err, result) {
  //res.send(JSON.stringify(result));
  //});
  res.send(JSON.stringify("PRECISA_SER_REVISADO!!"));
});
// End OS

const handleResult = (result, res) => {
  res.status(result.code).send(JSON.stringify(result));
};

// [UTIL] DO NOT USE THIS API, IT'S JUST FOR TEST PURPOSES.
app.get("/api/util/clients", (req, res) => {
  customerController.listClients(function(err, result) {
    res.send(JSON.stringify(result));
  });
});

app.get("/api/util/users", (req, res) => {
  userController.listUsers(function(err, result) {
    res.send(JSON.stringify(result));
  });
});

app.get("/api/util/loadBaseCustomerFromProvider", (req, res) => {
  const providerID = req.query.providerID;
  console.log(providerID);

  customerController.loadBaseCustomerFromProvider(providerID, function(
    err,
    result
  ) {
    res.send(JSON.stringify(result));
  });
});
// End UTIL

module.exports = app;
