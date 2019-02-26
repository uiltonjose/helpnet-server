const dateTime = require("node-datetime");
const emailUtil = require("../utils/EmailUtil");
const contentDAO = require("../dao/contentDAO");
const osDAO = require("../dao/osDAO");

function createOSNumber(providerId) {
  const dt = dateTime.create();
  const formatted = dt.format("Y-m-d");
  const y = formatted.substring(2, 4);
  const month = formatted.substring(5, 7);
  const d = formatted.substring(8, 10);
  return providerId + y + month + d;
}

module.exports = {
  //TODO Criar validações e adaptar retorno para o padrão
  registerOS: function registerOS(os, callback) {
    os.number = createOSNumber(os.providerId);
    osDAO.registerOS(os, (err, result) => {
      if (!err) {
        osDAO.getOSData(os, resultMail => {
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
    if (providerId === undefined || providerId === "") {
      resultResponse.code = 400;
      resultResponse.message = "Invalid Provider";
      callback(resultResponse);
    } else if (customerId === undefined || customerId === "") {
      resultResponse.code = 400;
      resultResponse.message = "Invalid Customer";
      callback(resultResponse);
    } else {
      osDAO.canOpen(providerId, customerId, (result, err) => {
        if (err) {
          resultResponse.code = 400;
          resultResponse.message = "Occur a problem during consult query.";
        } else {
          resultResponse.code = 200;
          if (result[0].total > 0) {
            resultResponse.message = "true";
          } else {
            resultResponse.message = "false";
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
      situationId === undefined ||
      isNaN(situationId) ||
      situationId < 1 ||
      situationId > 4
    ) {
      resultResponse.code = 400;
      resultResponse.message = "Invalid Situation";
      callback(resultResponse);
    } else if (osId === undefined || osId === "" || isNaN(osId)) {
      resultResponse.code = 400;
      resultResponse.message = "Invalid OS Id";
      callback(resultResponse);
    } else if (
      event.userId === undefined ||
      event.userId === "" ||
      isNaN(event.userId)
    ) {
      resultResponse.code = 400;
      resultResponse.message = "Invalid user id from event";
      callback(resultResponse);
    } else if (
      event.eventTypeID === undefined ||
      event.eventTypeID === "" ||
      isNaN(event.eventTypeID)
    ) {
      resultResponse.code = 400;
      resultResponse.message = "Invalid Event type";
      callback(resultResponse);
    } else {
      osDAO.changeSituationOS(object, (err, result) => {
        if (err) {
          resultResponse.code = 400;
          resultResponse.message =
            "Occur a problem during the change situation.";
        } else {
          resultResponse.code = 200;
          resultResponse.message =
            "Successfully updated status to OS " + result;
        }
        callback(resultResponse);
      });
    }
  },

  associateUser: function associateUser(os, callback) {
    const userId = os.userId;
    const osId = os.osId;
    const event = os.event;

    let resultResponse = {};
    if (userId === undefined || userId < 1 || isNaN(userId)) {
      resultResponse.code = 400;
      resultResponse.message = "Invalid User";
      callback(resultResponse);
    } else if (osId === undefined || osId === "" || isNaN(osId)) {
      resultResponse.code = 400;
      resultResponse.message = "Invalid OS Id";
      callback(resultResponse);
    } else if (
      event.userId === undefined ||
      event.userId === "" ||
      isNaN(event.userId)
    ) {
      resultResponse.code = 400;
      resultResponse.message = "Invalid user id from event";
      callback(resultResponse);
    } else if (
      event.eventTypeID === undefined ||
      event.eventTypeID === "" ||
      isNaN(event.eventTypeID)
    ) {
      resultResponse.code = 400;
      resultResponse.message = "Invalid Event type";
      callback(resultResponse);
    } else {
      osDAO.associateUser(os, (err, result) => {
        if (err) {
          resultResponse.code = 400;
          resultResponse.message =
            "Occur a problem during the change situation.";
        } else {
          resultResponse.code = 200;
          resultResponse.message =
            "User associated with success to OS " + result;
        }
        callback(resultResponse);
      });
    }
  },

  listOSBySituation: function listOSBySituation(
    providerId,
    situationId,
    callback
  ) {
    let resultResponse = {};
    if (
      situationId === undefined ||
      isNaN(situationId) ||
      situationId < 1 ||
      situationId > 4
    ) {
      resultResponse.code = 400;
      resultResponse.message = "Invalid Situation";
      callback(resultResponse);
    } else if (
      providerId === undefined ||
      providerId === "" ||
      isNaN(providerId)
    ) {
      resultResponse.code = 400;
      resultResponse.message = "Invalid provider Id";
      callback(resultResponse);
    } else {
      osDAO.listOSBySituation(providerId, situationId, (err, result) => {
        if (err) {
          resultResponse.code = 400;
          resultResponse.message =
            "Occur a problem during the change situation.";
        } else {
          resultResponse.code = 200;
          resultResponse.message = result;
        }
        callback(resultResponse);
      });
    }
  },

  //TODO Criar validações e adaptar retorno para o padrão

  listOSByProvider: function listOSByProvider(providerId, callback) {
    osDAO.listOSByProvider(providerId, function(err, result) {
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
