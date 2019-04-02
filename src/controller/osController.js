const dateTime = require("node-datetime");
const emailUtil = require("../utils/EmailUtil");
const osDAO = require("../dao/osDAO");
const StringUtil = require("../utils/StringUtil");
const notificationController = require("../controller/notificationController");
const Enum = require("../model/Enum");
const StatusCode = require("../utils/StatusCode");

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
    resultResponse.code = StatusCode.status.Bad_Request;

    if (StringUtil.isNotValidNumber(os.providerId)) {
      resultResponse.message = "Invalid Provider Id";
      callback(resultResponse);
    } else if (StringUtil.isNotValidNumber(os.customerId)) {
      resultResponse.message = "Invalid Customer Id";
      callback(resultResponse);
    } else if (StringUtil.isNotValidNumber(os.problemId)) {
      resultResponse.message = "Invalid Problem Id";
      callback(resultResponse);
    } else {
      os.number = createOSNumber(os.providerId);
      osDAO.registerOS(os, (err, result) => {
        if (!err) {
          osDAO.getOSData(os, (errMail, resultMail) => {
            if (errMail) {
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
              resultResponse.code = StatusCode.status.Ok;
              resultResponse.data = result[0].NUMERO;
              notificationController.sendNotificationForOSEvent(
                result,
                null,
                Enum.EventType.OPEN_OS
              );
              callback(resultResponse);
            }
          });
        } else {
          resultResponse.message = "Something went wrong in register OS.";
          callback(resultResponse);
        }
      });
    }
  },

  canOpen: function canOpen(providerId, customerId, callback) {
    let resultResponse = {};
    resultResponse.code = StatusCode.status.Bad_Request;

    if (StringUtil.isNotValidNumber(providerId)) {
      resultResponse.message = "Invalid Provider Id";
      callback(resultResponse);
    } else if (StringUtil.isNotValidNumber(customerId)) {
      resultResponse.message = "Invalid Customer Id";
      callback(resultResponse);
    } else {
      osDAO.canOpen(providerId, customerId, (err, result) => {
        if (err) {
          resultResponse.message = "Something went wrong in your query.";
        } else {
          resultResponse.code = StatusCode.status.Ok;
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
    let resultResponse = {};
    resultResponse.code = StatusCode.status.Bad_Request;

    const { situationId, osNumber, userId, event } = object;
    const eventTypeId = event.eventTypeID;
    const eventUserId = event.userId;

    if (
      StringUtil.isNotValidNumber(situationId) ||
      situationId < Enum.Situations.OPEN ||
      situationId > Enum.Situations.CONCLUDED
    ) {
      resultResponse.message = "Invalid Situation Id";
      callback(resultResponse);
    } else if (StringUtil.isNotValidNumber(osNumber)) {
      resultResponse.message = "Invalid OS Number";
      callback(resultResponse);
    } else if (StringUtil.isNotValidNumber(eventUserId)) {
      resultResponse.message = "Invalid user id from event";
      callback(resultResponse);
    } else if (StringUtil.isNotValidNumber(eventTypeId)) {
      resultResponse.message = "Invalid Event type Id";
      callback(resultResponse);
    } else if (
      situationId === Enum.Situations.WORK_IN_PROGRESS &&
      StringUtil.isNotValidNumber(userId)
    ) {
      resultResponse.message = "Invalid user id to associate with OS";
      callback(resultResponse);
    } else {
      osDAO.changeSituationOS(object, (err, result) => {
        if (err) {
          resultResponse.message = "Something went wrong in your query.";
        } else {
          const objectOS = result;
          resultResponse.code = StatusCode.status.Ok;
          resultResponse.message = `Successfully updated status to OS ${
            objectOS.number
          }`;
          notificationController.sendNotificationForOSEvent(
            objectOS,
            object.messageToCustomer,
            eventTypeId
          );
        }
        callback(resultResponse);
      });
    }
  },

  associateUserWithOs: function associateUserWithOs(os, callback) {
    const { userId, osId, event } = os;

    let resultResponse = {};
    resultResponse.code = StatusCode.status.Bad_Request;

    if (StringUtil.isNotValidNumber(userId)) {
      resultResponse.message = "Invalid User Id";
      callback(resultResponse);
    } else if (StringUtil.isNotValidNumber(osId)) {
      resultResponse.message = "Invalid OS Id";
      callback(resultResponse);
    } else if (StringUtil.isNotValidNumber(event.userId)) {
      resultResponse.message = "Invalid user id from event";
      callback(resultResponse);
    } else if (StringUtil.isNotValidNumber(event.eventTypeID)) {
      resultResponse.message = "Invalid Event type Id";
      callback(resultResponse);
    } else {
      osDAO.associateUserWithOs(os, (err, result) => {
        if (err) {
          resultResponse.message = "Something went wrong in your query.";
        } else {
          resultResponse.code = StatusCode.status.Ok;
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
    resultResponse.code = StatusCode.status.Bad_Request;

    if (StringUtil.isNotValidNumber(situationId)) {
      resultResponse.message = "Invalid Situation Id";
      callback(resultResponse);
    } else if (StringUtil.isNotValidNumber(providerId)) {
      resultResponse.message = "Invalid provider Id";
      callback(resultResponse);
    } else {
      osDAO.listOsByProviderIdAndSituationId(
        providerId,
        situationId,
        (err, result) => {
          if (err) {
            resultResponse.message = "Something went wrong in your query.";
          } else {
            resultResponse.code = StatusCode.status.Ok;
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
    resultResponse.code = StatusCode.status.Bad_Request;

    if (StringUtil.isNotValidNumber(providerId)) {
      resultResponse.message = "Invalid provider Id";
      callback(resultResponse);
    } else {
      osDAO.listOsByProviderIdAndSituationOpened(providerId, (err, result) => {
        if (err) {
          resultResponse.message = "Something went wrong in your query.";
        } else {
          resultResponse.code = StatusCode.status.Ok;
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
    resultResponse.code = StatusCode.status.Bad_Request;

    if (StringUtil.isNotValidNumber(providerId)) {
      resultResponse.message = "Invalid provider Id";
      callback(resultResponse);
    } else {
      osDAO.listOsByProviderIdAndSituationClosed(providerId, (err, result) => {
        if (err) {
          resultResponse.message = "Something went wrong in your query.";
        } else {
          resultResponse.code = StatusCode.status.Ok;
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
    resultResponse.code = StatusCode.status.Bad_Request;

    if (StringUtil.isNotValidNumber(providerId)) {
      resultResponse.message = "Invalid provider Id";
      callback(resultResponse);
    } else {
      osDAO.listOsByProviderIdAndInProgress(providerId, (err, result) => {
        if (err) {
          resultResponse.message = "Something went wrong in your query.";
        } else {
          resultResponse.code = StatusCode.status.Ok;
          resultResponse.message = result;
        }
        callback(resultResponse);
      });
    }
  },

  listOsByProviderId: function listOsByProviderId(providerId, callback) {
    let resultResponse = {};
    resultResponse.code = StatusCode.status.Bad_Request;

    if (StringUtil.isNotValidNumber(providerId)) {
      resultResponse.message = "Invalid Provider Id";
      callback(resultResponse);
    } else {
      osDAO.listOsByProviderId(providerId, (err, result) => {
        let resultResponse = {};
        if (err) {
          resultResponse.message = "Something went wrong in your query.";
        } else {
          resultResponse.code = StatusCode.status.Ok;
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
    resultResponse.code = StatusCode.status.Bad_Request;

    if (StringUtil.isNotValidNumber(providerId)) {
      resultResponse.message = "Invalid Provider Id";
      callback(resultResponse);
    } else if (StringUtil.isNotValidNumber(customerId)) {
      resultResponse.message = "Invalid Customer Id";
      callback(resultResponse);
    } else {
      osDAO.listOsByProviderIdAndCustomerId(providerId, customerId, function(
        err,
        result
      ) {
        let resultResponse = {};
        if (err) {
          resultResponse.message = "Occur a problem during the create list.";
        } else {
          resultResponse.code = StatusCode.status.Ok;
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
        resultResponse.code = StatusCode.status.Bad_Request;
        resultResponse.message = "Occur a problem during the create list.";
      } else {
        resultResponse.code = StatusCode.status.Ok;
        resultResponse.message = result;
      }
      callback(resultResponse);
    });
  },

  getOsByNumber: function getOsByNumber(numberOS, callback) {
    let resultResponse = {};
    resultResponse.code = StatusCode.status.Bad_Request;

    if (StringUtil.isNotValidNumber(numberOS)) {
      resultResponse.message = "Invalid Number OS";
      callback(resultResponse);
    } else {
      osDAO.getOsByNumber(numberOS, (err, result) => {
        let resultResponse = {};
        if (err) {
          resultResponse.message = "Occur a problem during the get OS.";
          callback(resultResponse);
        } else {
          let os = {};
          os.problemId = result[0].PROBLEMA_ID;
          os.providerId = result[0].PROVEDOR_ID;
          os.id = result[0].ID;
          os.customerId = result[0].CLIENTE_ID;
          osDAO.getOSData(os, (errOsData, result) => {
            if (errOsData) {
              resultResponse.message = "Something went wrong in your query.";
              console.log(errOsData);
            } else {
              osDAO.listEventFromOS(os.id, (errEventData, resultEvent) => {
                if (errEventData) {
                  resultResponse.message =
                    "Something went wrong in your query.";
                  console.log(errEventData);
                } else {
                  resultResponse.code = StatusCode.status.Ok;
                  result.event = resultEvent;
                  resultResponse.data = result;
                  callback(resultResponse);
                }
              });
            }
          });
        }
      });
    }
  }
};
