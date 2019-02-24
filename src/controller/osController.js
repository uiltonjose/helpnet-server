const dateTime = require("node-datetime");
const emailUtil = require("../utils/EmailUtil");
const contentDAO = require("../dao/contentDAO");
const osDAO = require("../dao/osDAO");
const StringUtil = require("../utils/StringUtil");

function createOSNumber(providerId) {
  const dt = dateTime.create();
  const formatted = dt.format("Y-m-d");
  const y = formatted.substring(2, 4);
  const month = formatted.substring(5, 7);
  const d = formatted.substring(8, 10);
  return providerId + y + month + d;
}

module.exports = {
  registerOS: function registerOS(os, callback) {
    os.number = createOSNumber(os.providerId);
    osDAO.registerOS(os, function(err, result) {
      if (!err) {
        osDAO.getOSData(os, function(errMail, resultMail) {
          if (errMail) {
            console.log(errMail);
          } else {
            osDescription = resultMail;
            const osHtml = emailUtil.builderContentMailNewOS(osDescription);
            emailUtil.sendMail(
              "Abertura da OS: " + osDescription.numeroOS,
              osHtml,
              osDescription.emailEnvioOS
            );
          }
        });
      }
      callback(err, result);
    });
  },

  canOpen: function canOpen(providerId, customerId, callback) {
    let resultResponse = {};

    if (StringUtil.isNullOrEmpty(providerId)) {
      resultResponse.code = 400;
      resultResponse.message = "Invalid Provider";
      callback(resultResponse);
    } else if (StringUtil.isNullOrEmpty(customerId)) {
      resultResponse.code = 400;
      resultResponse.message = "Invalid Customer";
      callback(resultResponse);
    } else {
      osDAO.canOpen(providerId, customerId, (err, result) => {
        if (err) {
          resultResponse.code = 400;
          resultResponse.message = "Something went wrong in your query.";
        } else {
          resultResponse.code = 200;
          if (result[0].total > 0) {
            resultResponse.data = { canOpen: "true" };
          } else {
            resultResponse.data = { canOpen: "false" };
          }
        }
        callback(resultResponse);
      });
    }
  },

  changeSituationOS: function changeSituationOS(object, callback) {
    osDAO.changeSituationOS(object, function(err, result) {
      callback(err, result);
    });
  },

  associateTechnical: function associateTechnical(os, callback) {
    osDAO.associateTechnical(os, function(err, result) {
      callback(err, result);
    });
  },

  listOSByProvider: function listOSByProvider(providerId, callback) {
    osDAO.listOSByProvider(providerId, function(err, result) {
      callback(err, result);
    });
  },

  listOSBySituation: function listOSBySituation(
    providerId,
    situationId,
    callback
  ) {
    osDAO.listOSBySituation(providerId, situationId, function(err, result) {
      callback(err, result);
    });
  },

  listOSByCustomer: function listOSByCustomer(
    providerId,
    customerId,
    callback
  ) {
    osDAO.listOSByCustomer(providerId, customerId, function(err, result) {
      callback(err, result);
    });
  },

  listSituations: function listSituations(callback) {
    osDAO.listSituations(function(err, result) {
      callback(err, result);
    });
  },

  // TODO will be deleted!
  listProblems: function listProblems(callback) {
    contentDAO.listProblems(function(err, result) {
      callback(err, result);
    });
  }
};
