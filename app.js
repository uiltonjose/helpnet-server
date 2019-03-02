const app = require("./src/app_config.js"),
  osController = require("./src/controller/osController"),
  customerController = require("./src/controller/customerController"),
  providerController = require("./src/controller/providerController"),
  contentController = require("./src/controller/contentController"),
  notificationController = require("./src/controller/notificationController"),
  userController = require("./src/controller/userController");

app.get("/", (req, res) => {
  res.send(JSON.stringify("HelpNet - Webservice alive! Ready to work."));
});
// Begin Content
app.get("/api/content/boot", (req, res) => {
  contentController.boot(result => {
    handleResult(result, res);
  });
});

/* TODO @Uil Can not remove this method since it is deprecated?
/**
 * @deprecated Since version 1.1.0. Will be deleted in version 1.2.0. Use boot instead.
 
app.get("/api/content/version", (req, res) => {
  contentController.deployVersion(function(result) {
    res.send(JSON.stringify(result));
  });
});

TODO @Uil I do not think it should be deprecated, since we can consume this api in another situation
/**
 * @deprecated Since version 1.1.0. Will be deleted in version 1.2.0. Use boot instead.
 */
app.get("/api/content/listProblems", (req, res) => {
  contentController.listAllProblemsOs(result => {
    handleResult(result, res);
  });
});

// End Content

// Begin Customer
app.get(
  "/api/customer/getProviderByCustomerCpfCnpjAndProviderCod",
  (req, res) => {
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
  }
);

app.get("/api/customer/listByProviderId", (req, res) => {
  const providerId = req.query.providerId;
  customerController.listCustomersByProviderId(providerId, result => {
    handleResult(result, res);
  });
});

//TODO - This API can not be automatically tested
app.get("/api/synchronizeCustomersWithProviders", (req, res) => {
  customerController.synchronizeCustomersWithProviders(result => {
    handleResult(result, res);
  });
});
// End Customer

// Begin PROVIDER
app.get("/api/provider/listProviders", (req, res) => {
  providerController.listAllProviders(result => {
    handleResult(result, res);
  });
});

app.put("/api/provider/updateProvider", (req, res) => {
  const provider = req.body;
  providerController.updateProvider(provider, result => {
    handleResult(result, res);
  });
});

app.post("/api/provider/addProvider", (req, res) => {
  const provider = req.body;
  providerController.addProvider(provider, result => {
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

app.put("/api/notification/updateNotificationAsRead", (req, res) => {
  const notificationId = req.body.notificationId;
  const customerId = req.body.customerId;
  notificationController.updateNotificationAsRead(
    notificationId,
    customerId,
    result => {
      handleResult(result, res);
    }
  );
});

app.get("/api/notification/listByCustomerId", (req, res) => {
  const customerId = req.query.customerId;

  notificationController.listNotificationsByCustomerId(customerId, result => {
    handleResult(result, res);
  });
});

app.get("/api/notification/listByProviderId", (req, res) => {
  const providerId = req.query.providerId;
  notificationController.listNotificationsByProviderId(providerId, result => {
    handleResult(result, res);
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

app.put("/api/user/activateUserWithProvider", (req, res) => {
  const userObj = req.body;
  userController.activateUserWithProvider(userObj, result => {
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
  osController.listAllSituationOS(result => {
    handleResult(result, res);
  });
});

app.get("/api/os/listByProviderId", (req, res) => {
  const providerId = req.query.providerId;
  osController.listOssByProviderId(providerId, result => {
    handleResult(result, res);
  });
});

app.get("/api/os/listBySituation", (req, res) => {
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

app.get("/api/os/listByCustomer", (req, res) => {
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

app.post("/api/os/register", (req, res) => {
  const os = req.body;
  osController.registerOS(os, result => {
    handleResult(result, res);
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
  osController.changeSituationOS(object, result => {
    handleResult(result, res);
  });
});

app.post("/api/os/associateUser", (req, res) => {
  const os = req.body;
  osController.associateUserWithOs(os, result => {
    handleResult(result, res);
  });
});
// End OS

// Begin UTIL
app.get("/api/util/users", (req, res) => {
  userController.listAllUsers(result => {
    handleResult(result, res);
  });
});

app.get("/api/util/loadBaseCustomerFromProvider", (req, res) => {
  const providerID = req.query.providerID;
  console.log(providerID);
  customerController.loadBaseCustomerFromProvider(providerID, result => {
    handleResult(result, res);
  });
});
// End UTIL

const handleResult = (result, res) => {
  res.status(result.code).send(JSON.stringify(result));
};

module.exports = app;
