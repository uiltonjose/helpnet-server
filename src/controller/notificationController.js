const notificationDAO = require("../dao/notificationDAO");
const Enum = require("../model/Enum");
const StatusCode = require("../utils/StatusCode");

const sendNotification = (data, resolve) => {
  const headers = {
    "Content-Type": "application/json; charset=utf-8",
    Authorization: "Basic YmI4Y2UzZGYtNjc4YS00ZGFjLWEwN2YtMWExNWI0MzZmODE0"
  };

  const options = {
    host: "onesignal.com",
    port: 443,
    path: "/api/v1/notifications",
    method: "POST",
    headers: headers
  };

  const https = require("https");
  const req = https.request(options, result => {
    result.on("data", data => {
      let resultResponse = {};
      resultResponse.code = StatusCode.status.Ok;

      const responseData = JSON.parse(data);
      if (responseData.errors) {
        resultResponse.code = StatusCode.status.Not_Acceptable;
      }
      resultResponse.data = responseData;
      resolve(resultResponse);
    });
  });

  req.on("error", e => {
    let resultResponse = {};
    resultResponse.code = StatusCode.status.Bad_Request;
    resultResponse.data = e;
    resolve(resultResponse);
  });

  req.write(JSON.stringify(data));
  req.end();
};

const createNotification = notificationObj => {
  return new Promise(resolve => {
    const bodyData = {
      app_id: "60e482a2-dd96-4205-9a08-53ea6a843454",
      headings: { en: notificationObj.title },
      contents: { en: notificationObj.message },
      tags: notificationObj.tags,
      content_available: 1,
      blockOpenNewOS: notificationObj.blockOpenNewOS,
      userId: notificationObj.userId
    };

    const data = {};
    notificationDAO.saveNotification(notificationObj).then(
      notificationId => {
        data.notificationId = notificationId;
        bodyData.data = data;
        sendNotification(bodyData, resolve);
      },
      error => {
        data.code = StatusCode.status.Bad_Request;
        data.message = "Error try to send notification";
        data.error = error;
        resolve(data);
      }
    );
  });
};

const updateNotificationAsRead = (notificationId, customerId) => {
  return new Promise(resolve => {
    let resultResponse = {};

    notificationDAO.updateNotificationAsRead(notificationId, customerId).then(
      () => {
        resultResponse.code = StatusCode.status.Ok;
        resultResponse.data = `A Notificação ${notificationId} do cliente ${customerId} foi atualizada com sucesso.`;
        resolve(resultResponse);
      },
      error => {
        resultResponse.code = StatusCode.status.Not_Acceptable;
        resultResponse.data = "Something went wrong in your query.";
        resultResponse.error = error;
        resolve(resultResponse);
      }
    );
  });
};

const listNotificationsByCustomerId = customerId => {
  return new Promise(resolve => {
    notificationDAO.listNotificationsByCustomerId(customerId).then(
      result => {
        let resultResponse = {};
        resultResponse.code = StatusCode.status.Ok;
        resultResponse.data = result;
        resolve(resultResponse);
      },
      error => {
        resultResponse.code = StatusCode.status.Not_Acceptable;
        resultResponse.message = "Something went wrong in your query.";
        resultResponse.error = error;
        resolve(resultResponse);
      }
    );
  });
};

const listNotificationsByProviderId = providerId => {
  return new Promise(resolve => {
    notificationDAO.listNotificationsByProviderId(providerId).then(
      result => {
        let resultResponse = {};
        resultResponse.code = StatusCode.status.Ok;
        resultResponse.data = result;
        resolve(resultResponse);
      },
      error => {
        resultResponse.code = StatusCode.status.Not_Acceptable;
        resultResponse.message = "Something went wrong in your query.";
        resultResponse.error = error;
        resolve(resultResponse);
      }
    );
  });
};

/*
 * List all default message for notification
 */
const listDefaultMessageForNotification = () => {
  return new Promise(resolve => {
    let resultResponse = {};
    notificationDAO.listDefaultMessageForNotification().then(
      result => {
        resultResponse.code = StatusCode.status.Ok;
        resultResponse.data = result;
        resolve(resultResponse);
      },
      error => {
        resultResponse.code = StatusCode.status.Bad_Request;
        resultResponse.message = "Occurred a problem during the list creation.";
        resultResponse.error = error;
        resolve(resultResponse);
      }
    );
  });
};

/**
 * @description This method sends standard notifications according to the event applied to OS
 * @param {*} osObject
 * @param {*} eventTypeId
 */
const sendNotificationForOSEvent = (
  osObject,
  messageToCustomer,
  eventTypeId
) => {
  return new Promise(resolve => {
    let resultResponse = {};
    let message = "";
    let title = "";
    if (eventTypeId === Enum.EventType.OPEN_OS) {
      title = `Sua OS foi aberta com o número ${osObject[0].NUMERO}`;
      message = `Estamos trabalhando para resolver o seu problema, entraremos em contato assim que o problema for solucionado.`;
    } else if (eventTypeId === Enum.EventType.CLOSED_OS) {
      title = `Sua OS  ${osObject[0].NUMERO} foi finalizada`;
      message = `Seu problema foi resolvido e sua internet está disponível novamente.`;
    }

    if (title && message) {
      builderNotification(osObject, messageToCustomer, title, message, resolve);
    } else {
      resultResponse.code = StatusCode.status.No_Content;
      resolve(resultResponse);
    }
  });
};

const builderNotification = (
  osObject,
  messageToCustomer,
  title,
  message,
  resolve
) => {
  const providerId = osObject[0].PROVEDOR_ID;
  const customerId = osObject[0].CLIENTE_ID;
  let notificationObj = {};
  notificationObj.title = title;
  notificationObj.message = message;
  notificationObj.userId = customerId;
  if (messageToCustomer != null) {
    notificationObj.message = `${message}  ${messageToCustomer}`;
  }
  notificationObj.blockNotification = "false";
  notificationObj.tags = [{}];
  notificationObj.tags[0].key = `${providerId}_${customerId}`;
  notificationObj.tags[0].relation = "=";
  notificationObj.tags[0].value = "1";

  //This is a parallel action, does not interfere with the flow, but we need to record if the notification was sent or not
  resolve(createNotification(notificationObj));
};

module.exports = {
  createNotification: createNotification,
  updateNotificationAsRead: updateNotificationAsRead,
  listNotificationsByCustomerId: listNotificationsByCustomerId,
  listNotificationsByProviderId: listNotificationsByProviderId,
  listDefaultMessageForNotification: listDefaultMessageForNotification,
  sendNotificationForOSEvent: sendNotificationForOSEvent
};
