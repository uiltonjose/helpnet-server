const dateTime = require("node-datetime");
const emailUtil = require("../utils/EmailUtil");
const osDAO = require("../dao/osDAO");
const StringUtil = require("../utils/StringUtil");
const notificationController = require("../controller/notificationController");
const Enum = require("../model/Enum");
const StatusCode = require("../utils/StatusCode");

const createOSNumber = providerId => {
  const dt = dateTime.create();
  const formatted = dt.format("Y-m-d");
  const y = formatted.substring(2, 4);
  const month = formatted.substring(5, 7);
  const d = formatted.substring(8, 10);
  return providerId + y + month + d;
};

const registerOS = os => {
  return new Promise(resolve => {
    let resultResponse = {};
    resultResponse.code = StatusCode.status.Bad_Request;

    if (StringUtil.isNotValidNumber(os.providerId)) {
      resultResponse.message = "Invalid Provider Id";
      resolve(resultResponse);
    } else if (StringUtil.isNotValidNumber(os.customerId)) {
      resultResponse.message = "Invalid Customer Id";
      resolve(resultResponse);
    } else if (StringUtil.isNotValidNumber(os.problemId)) {
      resultResponse.message = "Invalid Problem Id";
      resolve(resultResponse);
    } else {
      os.number = createOSNumber(os.providerId);
      osDAO.registerOS(os).then(
        result => {
          osDAO.getOSData(os).then(
            osDescription => {
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
              resolve(resultResponse);
            },
            errMail => {
              resultResponse.message = "Something went wrong in your query.";
              resultResponse.errMail = errMail;
              resolve(resultResponse);
            }
          );
        },
        error => {
          resultResponse.message = "Something went wrong in register OS.";
          resultResponse.error = error;
          resolve(resultResponse);
        }
      );
    }
  });
};

const canOpen = (providerId, customerId) => {
  return new Promise(resolve => {
    let resultResponse = {};
    resultResponse.code = StatusCode.status.Bad_Request;

    if (StringUtil.isNotValidNumber(providerId)) {
      resultResponse.message = "Invalid Provider Id";
      resolve(resultResponse);
    } else if (StringUtil.isNotValidNumber(customerId)) {
      resultResponse.message = "Invalid Customer Id";
      resolve(resultResponse);
    } else {
      osDAO.canOpen(providerId, customerId).then(
        result => {
          resultResponse.code = StatusCode.status.Ok;

          if (result[0].total > 0) {
            resultResponse.data = {
              canOpen: "false",
              countOs: result[0].total
            };
          } else {
            resultResponse.data = { canOpen: "true" };
          }
          resolve(resultResponse);
        },
        error => {
          resultResponse.message = "Something went wrong in your query.";
          resultResponse.error = error;
          resolve(resultResponse);
        }
      );
    }
  });
};

const changeSituationOS = object => {
  return new Promise(resolve => {
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
      resolve(resultResponse);
    } else if (StringUtil.isNotValidNumber(osNumber)) {
      resultResponse.message = "Invalid OS Number";
      resolve(resultResponse);
    } else if (StringUtil.isNotValidNumber(eventUserId)) {
      resultResponse.message = "Invalid user id from event";
      resolve(resultResponse);
    } else if (StringUtil.isNotValidNumber(eventTypeId)) {
      resultResponse.message = "Invalid Event type Id";
      resolve(resultResponse);
    } else if (
      situationId === Enum.Situations.WORK_IN_PROGRESS &&
      StringUtil.isNotValidNumber(userId)
    ) {
      resultResponse.message = "Invalid user id to associate with OS";
      resolve(resultResponse);
    } else {
      osDAO.changeSituationOS(object).then(
        objectOS => {
          resultResponse.code = StatusCode.status.Ok;
          resultResponse.message = `Successfully updated status to OS ${
            objectOS[0].NUMERO
          }`;
          notificationController.sendNotificationForOSEvent(
            objectOS,
            object.messageToCustomer,
            eventTypeId
          );
          resolve(resultResponse);
        },
        error => {
          resultResponse.message = "Something went wrong in your query.";
          resultResponse.error = error;
          resolve(resultResponse);
        }
      );
    }
  });
};

const associateUserWithOs = os => {
  return new Promise(resolve => {
    const { userId, osId, event } = os;

    let resultResponse = {};
    resultResponse.code = StatusCode.status.Bad_Request;

    if (StringUtil.isNotValidNumber(userId)) {
      resultResponse.message = "Invalid User Id";
      resolve(resultResponse);
    } else if (StringUtil.isNotValidNumber(osId)) {
      resultResponse.message = "Invalid OS Id";
      resolve(resultResponse);
    } else if (StringUtil.isNotValidNumber(event.userId)) {
      resultResponse.message = "Invalid user id from event";
      resolve(resultResponse);
    } else if (StringUtil.isNotValidNumber(event.eventTypeID)) {
      resultResponse.message = "Invalid Event type Id";
      resolve(resultResponse);
    } else {
      osDAO.associateUserWithOs(os).then(
        result => {
          resultResponse.code = StatusCode.status.Ok;
          resultResponse.message =
            "User associated with success to OS " + result;
          resolve(resultResponse);
        },
        error => {
          resultResponse.message = "Something went wrong in your query.";
          resultResponse.error = error;
          resolve(resultResponse);
        }
      );
    }
  });
};

const listOsByProviderIdAndSituationId = (providerId, situationId) => {
  return new Promise(resolve => {
    let resultResponse = {};
    resultResponse.code = StatusCode.status.Bad_Request;

    if (StringUtil.isNotValidNumber(situationId)) {
      resultResponse.message = "Invalid Situation Id";
      resolve(resultResponse);
    } else if (StringUtil.isNotValidNumber(providerId)) {
      resultResponse.message = "Invalid provider Id";
      resolve(resultResponse);
    } else {
      osDAO.listOsByProviderIdAndSituationId(providerId, situationId).then(
        result => {
          resultResponse.code = StatusCode.status.Ok;
          resultResponse.message = result;
          resolve(resultResponse);
        },
        error => {
          resultResponse.message = "Something went wrong in your query.";
          resultResponse.error = error;
          resolve(resultResponse);
        }
      );
    }
  });
};

const listOsByProviderIdAndSituationOpened = providerId => {
  return new Promise(resolve => {
    let resultResponse = {};
    resultResponse.code = StatusCode.status.Bad_Request;

    if (StringUtil.isNotValidNumber(providerId)) {
      resultResponse.message = "Invalid provider Id";
      resolve(resultResponse);
    } else {
      osDAO.listOsByProviderIdAndSituationOpened(providerId).then(
        result => {
          resultResponse.code = StatusCode.status.Ok;
          resultResponse.message = result;
          resolve(resultResponse);
        },
        error => {
          resultResponse.message = "Something went wrong in your query.";
          resultResponse.error = error;
          resolve(resultResponse);
        }
      );
    }
  });
};

const listOsByProviderIdAndSituationClosed = providerId => {
  return new Promise(resolve => {
    let resultResponse = {};
    resultResponse.code = StatusCode.status.Bad_Request;

    if (StringUtil.isNotValidNumber(providerId)) {
      resultResponse.message = "Invalid provider Id";
      resolve(resultResponse);
    } else {
      osDAO.listOsByProviderIdAndSituationClosed(providerId).then(
        result => {
          resultResponse.code = StatusCode.status.Ok;
          resultResponse.message = result;
          resolve(resultResponse);
        },
        error => {
          resultResponse.message = "Something went wrong in your query.";
          resultResponse.error = error;
          resolve(resultResponse);
        }
      );
    }
  });
};

const listOsByProviderIdAndInProgress = providerId => {
  return new Promise(resolve => {
    let resultResponse = {};
    resultResponse.code = StatusCode.status.Bad_Request;

    if (StringUtil.isNotValidNumber(providerId)) {
      resultResponse.message = "Invalid provider Id";
      resolve(resultResponse);
    } else {
      osDAO.listOsByProviderIdAndInProgress(providerId).then(
        result => {
          resultResponse.code = StatusCode.status.Ok;
          resultResponse.message = result;
          resolve(resultResponse);
        },
        error => {
          resultResponse.message = "Something went wrong in your query.";
          resultResponse.error = error;
          resolve(resultResponse);
        }
      );
    }
  });
};

const listOsByProviderId = providerId => {
  return new Promise(resolve => {
    let resultResponse = {};
    resultResponse.code = StatusCode.status.Bad_Request;

    if (StringUtil.isNotValidNumber(providerId)) {
      resultResponse.message = "Invalid Provider Id";
      resolve(resultResponse);
    } else {
      osDAO.listOsByProviderId(providerId).then(
        result => {
          resultResponse.code = StatusCode.status.Ok;
          resultResponse.message = result;
          resolve(resultResponse);
        },
        error => {
          resultResponse.message = "Something went wrong in your query.";
          resultResponse.error = error;
          resolve(resultResponse);
        }
      );
    }
  });
};

const listOsByProviderIdAndCustomerId = (providerId, customerId) => {
  return new Promise(resolve => {
    let resultResponse = {};
    resultResponse.code = StatusCode.status.Bad_Request;

    if (StringUtil.isNotValidNumber(providerId)) {
      resultResponse.message = "Invalid Provider Id";
      resolve(resultResponse);
    } else if (StringUtil.isNotValidNumber(customerId)) {
      resultResponse.message = "Invalid Customer Id";
      resolve(resultResponse);
    } else {
      osDAO.listOsByProviderIdAndCustomerId(providerId, customerId).then(
        result => {
          resultResponse.code = StatusCode.status.Ok;
          resultResponse.message = result;
          resolve(resultResponse);
        },
        error => {
          resultResponse.message = "Occur a problem during the create list.";
          resultResponse.error = error;
          resolve(resultResponse);
        }
      );
    }
  });
};

const listAllSituationOS = () => {
  return new Promise(resolve => {
    let resultResponse = {};
    osDAO.listAllSituationOS().then(
      result => {
        resultResponse.code = StatusCode.status.Ok;
        resultResponse.message = result;
        resolve(resultResponse);
      },
      error => {
        resultResponse.code = StatusCode.status.Bad_Request;
        resultResponse.message = "Occur a problem during the create list.";
        resultResponse.error = error;
        resolve(resultResponse);
      }
    );
  });
};

const getOsByNumber = numberOS => {
  return new Promise(resolve => {
    let resultResponse = {};
    resultResponse.code = StatusCode.status.Bad_Request;

    if (StringUtil.isNotValidNumber(numberOS)) {
      resultResponse.message = "Invalid Number OS";
      resolve(resultResponse);
    } else {
      osDAO.getOsByNumber(numberOS).then(
        osResult => {
          let os = {};
          os.problemId = osResult[0].PROBLEMA_ID;
          os.providerId = osResult[0].PROVEDOR_ID;
          os.id = osResult[0].ID;
          os.customerId = osResult[0].CLIENTE_ID;

          osDAO.getOSData(os).then(
            result => {
              listEventsFromOs(os, resultResponse, result, resolve);
            },
            errorOs => {
              resultResponse.message = "Something went wrong in your query.";
              resultResponse.error = errorOs;
              resolve(resultResponse);
            }
          );
        },
        error => {
          resultResponse.message = "Occur a problem during the get OS.";
          resultResponse.error = error;
          resolve(resultResponse);
        }
      );
    }
  });
};

const listEventsFromOs = (os, resultResponse, result, resolve) => {
  osDAO.listEventFromOS(os.id).then(
    resultEvent => {
      resultResponse.code = StatusCode.status.Ok;
      result.event = resultEvent;
      resultResponse.data = result;
      resolve(resultResponse);
    },
    errEventData => {
      resultResponse.message = "Something went wrong in your query.";
      resultResponse.error = errEventData;
      resolve(resultResponse);
    }
  );
};

module.exports = {
  registerOS: registerOS,
  canOpen: canOpen,
  changeSituationOS: changeSituationOS,
  associateUserWithOs: associateUserWithOs,
  listOsByProviderIdAndSituationId: listOsByProviderIdAndSituationId,
  listOsByProviderIdAndSituationOpened: listOsByProviderIdAndSituationOpened,
  listOsByProviderIdAndSituationClosed: listOsByProviderIdAndSituationClosed,
  listOsByProviderIdAndInProgress: listOsByProviderIdAndInProgress,
  listOsByProviderId: listOsByProviderId,
  listOsByProviderIdAndCustomerId: listOsByProviderIdAndCustomerId,
  listAllSituationOS: listAllSituationOS,
  getOsByNumber: getOsByNumber
};
