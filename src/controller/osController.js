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
    let resultResponse = {};
    if (StringUtil.isNotValidNumber(os.providerId)) {
      resultResponse.code = 400;
      resultResponse.message = "Invalid Provider Id";
      callback(resultResponse);
    } else if (StringUtil.isNotValidNumber(os.customerId)) {
      resultResponse.code = 400;
      resultResponse.message = "Invalid Customer Id";
      callback(resultResponse);
    } else if (StringUtil.isNotValidNumber(os.problemId)) {
      resultResponse.code = 400;
      resultResponse.message = "Invalid Problem Id";
      callback(resultResponse);
    } else {
      os.number = createOSNumber(os.providerId);
      osDAO.registerOS(os, (err, result) => {
        if (!err) {
          osDAO.getOSData(os, (errMail, resultMail) => {
            if (errMail) {
              resultResponse.code = 400;
              resultResponse.message = "Something went wrong in your query.";
              console.log(errMail);
            } else {
              osDescription = resultMail;
              const osHtml = emailUtil.builderContentMailNewOS(osDescription);
              emailUtil.sendMail(
                "Abertura da OS: " + osDescription.numeroOS,
                osHtml,
                osDescription.emailEnvioOS
              );
              resultResponse.code = 200;
              resultResponse.message = result;
              callback(resultResponse);
            }
          });
        } else {
          resultResponse.code = 400;
          resultResponse.message = "Something went wrong in register OS.";
          callback(resultResponse);
        }
      });
    }
  },

  canOpen: function canOpen(providerId, customerId, callback) {
    let resultResponse = {};
    if (StringUtil.isNotValidNumber(providerId)) {
      resultResponse.code = 400;
      resultResponse.message = "Invalid Provider Id";
      callback(resultResponse);
    } else if (StringUtil.isNotValidNumber(customerId)) {
      resultResponse.code = 400;
      resultResponse.message = "Invalid Customer Id";
      callback(resultResponse);
    } else {
      osDAO.canOpen(providerId, customerId, (err, result) => {
        console.log("aqui", err);
        if (err) {
          resultResponse.code = 400;
          resultResponse.message = "Something went wrong in your query.";
        } else {
          resultResponse.code = 200;
          if (result[0].total > 0) {
            resultResponse.data = {
              canOpen: "false",
              countOs: result[0].total
            };
          } else {
            resultResponse.data = { canOpen: "true" };
          }
        }
        callback(resultResponse);
      });
    }
  },

  changeSituationOS: function changeSituationOS(object, callback) {
    const situationId = object.situationId;
    const osId = object.osId;
    const event = object.event;
    const userId = event.userId;
    let resultResponse = {};
    if (
      StringUtil.isNotValidNumber(situationId) ||
      situationId < 1 ||
      situationId > 4
    ) {
      resultResponse.code = 400;
      resultResponse.message = "Invalid Situation Id";
      callback(resultResponse);
    } else if (StringUtil.isNotValidNumber(osId)) {
      resultResponse.code = 400;
      resultResponse.message = "Invalid OS Id";
      callback(resultResponse);
    } else if (StringUtil.isNotValidNumber(userId)) {
      resultResponse.code = 400;
      resultResponse.message = "Invalid user id from event";
      callback(resultResponse);
    } else if (StringUtil.isNotValidNumber(event.eventTypeID)) {
      resultResponse.code = 400;
      resultResponse.message = "Invalid Event type Id";
      callback(resultResponse);
    } else {
      osDAO.changeSituationOS(object, (err, result) => {
        if (err) {
          resultResponse.code = 400;
          resultResponse.message = "Something went wrong in your query.";
        } else {
          resultResponse.code = 200;
          resultResponse.message =
            "Successfully updated status to OS " + result;
        }
        callback(resultResponse);
      });
    }
  },

  associateUserWithOs: function associateUserWithOs(os, callback) {
    const userId = os.userId;
    const osId = os.osId;
    const event = os.event;

    let resultResponse = {};
    if (StringUtil.isNotValidNumber(userId)) {
      resultResponse.code = 400;
      resultResponse.message = "Invalid User Id";
      callback(resultResponse);
    } else if (StringUtil.isNotValidNumber(osId)) {
      resultResponse.code = 400;
      resultResponse.message = "Invalid OS Id";
      callback(resultResponse);
    } else if (StringUtil.isNotValidNumber(event.userId)) {
      resultResponse.code = 400;
      resultResponse.message = "Invalid user id from event";
      callback(resultResponse);
    } else if (StringUtil.isNotValidNumber(event.eventTypeID)) {
      resultResponse.code = 400;
      resultResponse.message = "Invalid Event type Id";
      callback(resultResponse);
    } else {
      osDAO.associateUserWithOs(os, (err, result) => {
        if (err) {
          resultResponse.code = 400;
          resultResponse.message = "Something went wrong in your query.";
        } else {
          resultResponse.code = 200;
          resultResponse.message =
            "User associated with success to OS " + result;
        }
        callback(resultResponse);
      });
    }
  },

  listOsByProviderIdAndSituationId: function listOsByProviderIdAndSituationId(
    providerId,
    situationId,
    callback
  ) {
    let resultResponse = {};
    if (StringUtil.isNotValidNumber(situationId)) {
      resultResponse.code = 400;
      resultResponse.message = "Invalid Situation Id";
      callback(resultResponse);
    } else if (StringUtil.isNotValidNumber(providerId)) {
      resultResponse.code = 400;
      resultResponse.message = "Invalid provider Id";
      callback(resultResponse);
    } else {
      osDAO.listOsByProviderIdAndSituationId(
        providerId,
        situationId,
        (err, result) => {
          if (err) {
            resultResponse.code = 400;
            resultResponse.message = "Something went wrong in your query.";
          } else {
            resultResponse.code = 200;
            resultResponse.message = result;
          }
          callback(resultResponse);
        }
      );
    }
  },

  listOsByProviderIdAndSituationOpened: function listOsByProviderIdAndSituationOpened(
    providerId,
    callback
  ) {
    let resultResponse = {};
    if (StringUtil.isNotValidNumber(providerId)) {
      resultResponse.code = 400;
      resultResponse.message = "Invalid provider Id";
      callback(resultResponse);
    } else {
      osDAO.listOsByProviderIdAndSituationOpened(providerId, (err, result) => {
        if (err) {
          resultResponse.code = 400;
          resultResponse.message = "Something went wrong in your query.";
        } else {
          resultResponse.code = 200;
          resultResponse.message = result;
        }
        callback(resultResponse);
      });
    }
  },

  listOsByProviderIdAndSituationClosed: function listOsByProviderIdAndSituationClosed(
    providerId,
    callback
  ) {
    let resultResponse = {};
    if (StringUtil.isNotValidNumber(providerId)) {
      resultResponse.code = 400;
      resultResponse.message = "Invalid provider Id";
      callback(resultResponse);
    } else {
      osDAO.listOsByProviderIdAndSituationClosed(providerId, (err, result) => {
        if (err) {
          resultResponse.code = 400;
          resultResponse.message = "Something went wrong in your query.";
        } else {
          resultResponse.code = 200;
          resultResponse.message = result;
        }
        callback(resultResponse);
      });
    }
  },

  listOsByProviderIdAndInProgress: function listOsByProviderIdAndInProgress(
    providerId,
    callback
  ) {
    let resultResponse = {};
    if (StringUtil.isNotValidNumber(providerId)) {
      resultResponse.code = 400;
      resultResponse.message = "Invalid provider Id";
      callback(resultResponse);
    } else {
      osDAO.listOsByProviderIdAndInProgress(providerId, (err, result) => {
        if (err) {
          resultResponse.code = 400;
          resultResponse.message = "Something went wrong in your query.";
        } else {
          resultResponse.code = 200;
          resultResponse.message = result;
        }
        callback(resultResponse);
      });
    }
  },

  listOsByProviderId: function listOsByProviderId(providerId, callback) {
    let resultResponse = {};
    if (StringUtil.isNotValidNumber(providerId)) {
      resultResponse.code = 400;
      resultResponse.message = "Invalid Provider Id";
      callback(resultResponse);
    } else {
      osDAO.listOsByProviderId(providerId, (err, result) => {
        let resultResponse = {};
        if (err) {
          resultResponse.code = 400;
          resultResponse.message = "Something went wrong in your query.";
        } else {
          resultResponse.code = 200;
          resultResponse.message = result;
        }
        callback(resultResponse);
      });
    }
  },

  listOsByProviderIdAndCustomerId: function listOsByProviderIdAndCustomerId(
    providerId,
    customerId,
    callback
  ) {
    let resultResponse = {};
    if (StringUtil.isNotValidNumber(providerId)) {
      resultResponse.code = 400;
      resultResponse.message = "Invalid Provider Id";
      callback(resultResponse);
    } else if (StringUtil.isNotValidNumber(customerId)) {
      resultResponse.code = 400;
      resultResponse.message = "Invalid Customer Id";
      callback(resultResponse);
    } else {
      osDAO.listOsByProviderIdAndCustomerId(providerId, customerId, function(
        err,
        result
      ) {
        let resultResponse = {};
        if (err) {
          resultResponse.code = 400;
          resultResponse.message = "Occur a problem during the create list.";
        } else {
          resultResponse.code = 200;
          resultResponse.message = result;
        }
        callback(resultResponse);
      });
    }
  },

  listAllSituationOS: function listAllSituationOS(callback) {
    osDAO.listAllSituationOS((err, result) => {
      let resultResponse = {};
      if (err) {
        resultResponse.code = 400;
        resultResponse.message = "Occur a problem during the create list.";
      } else {
        resultResponse.code = 200;
        resultResponse.message = result;
      }
      callback(resultResponse);
    });
  }
};
