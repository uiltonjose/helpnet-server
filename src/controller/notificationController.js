const notificationDAO = require("../dao/notificationDAO");
const Enum = require("../model/Enum");

const sendNotification = (data, callback) => {
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
      resultResponse.code = 200;

      const responseData = JSON.parse(data);
      if (responseData.errors) {
        resultResponse.code = 406;
      }
      resultResponse.data = responseData;
      callback(resultResponse);
    });
  });

  req.on("error", e => {
    let resultResponse = {};
    resultResponse.code = 400;
    resultResponse.data = e;
    callback(resultResponse);
  });

  req.write(JSON.stringify(data));
  req.end();
};

const createNotification = (notificationObj, callback) => {
  const bodyData = {
    app_id: "60e482a2-dd96-4205-9a08-53ea6a843454",
    headings: { en: notificationObj.title },
    contents: { en: notificationObj.message },
    tags: notificationObj.tags,
    content_available: 1,
    blockOpenNewOS: notificationObj.blockOpenNewOS,
    userId: notificationObj.userId
  };

  notificationDAO.saveNotification(notificationObj, (err, notificationId) => {
    const data = {};
    if (!err) {
      data.notificationId = notificationId;
      bodyData.data = data;
      sendNotification(bodyData, callback);
    } else {
      data.code = 400;
      data.message = "Error try to send notification";
      callback(data);
    }
  });
};

const updateNotificationAsRead = (notificationId, customerId, callback) => {
  notificationDAO.updateNotificationAsRead(
    notificationId,
    customerId,
    (err, result) => {
      let resultResponse = {};
      if (!err) {
        resultResponse.code = 200;
        resultResponse.data = result;
      } else {
        resultResponse.code = 406;
        resultResponse.data = "Something went wrong in your query.";
      }
      callback(resultResponse);
    }
  );
};

const listNotificationsByCustomerId = (customerId, callback) => {
  notificationDAO.listNotificationsByCustomerId(customerId, (err, result) => {
    let resultResponse = {};
    resultResponse.code = 200;
    resultResponse.data = result;
    if (err) {
      resultResponse.code = 406;
      resultResponse.data = "Something went wrong in your query.";
    }
    callback(resultResponse);
  });
};

const listNotificationsByProviderId = (providerId, callback) => {
  notificationDAO.listNotificationsByProviderId(providerId, (err, result) => {
    let resultResponse = {};
    resultResponse.code = 200;
    resultResponse.data = result;
    if (err) {
      resultResponse.code = 406;
      resultResponse.data = "Something went wrong in your query.";
    }
    callback(resultResponse);
  });
};

/*
// List all default message for notification
*/
const listDefaultMessageForNotification = callback => {
  notificationDAO.listDefaultMessageForNotification((err, result) => {
    let resultResponse = {};
    if (err) {
      resultResponse.code = 400;
      resultResponse.message = "Occurred a problem during the list creation.";
    } else {
      resultResponse.code = 200;
      resultResponse.data = result;
    }
    callback(resultResponse);
  });
};

/**
 * @description This method sends standard notifications according to the event applied to OS
 * @param {*} osObject
 * @param {*} eventTypeId
 */
const sendNotificationForOSEvent = (osObject, eventTypeId, callback) => {
  let message = "";
  let title = "";
  if (eventTypeId === Enum.EventType.OPEN_OS) {
    title = `Sua OS foi aberta com o número ${osObject[0].NUMERO}`;
    message = `Estamos trabalhando para resolver o seu problema, entraremos em contato assim que o problema for solucionado.`;
    builderNotification(osObject, title, message, callback);
  } else if (eventTypeId === Enum.EventType.CLOSED_OS) {
    title = `Sua OS  ${osObject[0].NUMERO} foi finalizada`;
    message = `Seu problema foi resolvido e sua internet está disponível novamente.`;
    builderNotification(osObject, title, message, callback);
  }
};

module.exports = {
  createNotification: createNotification,
  updateNotificationAsRead: updateNotificationAsRead,
  listNotificationsByCustomerId: listNotificationsByCustomerId,
  listNotificationsByProviderId: listNotificationsByProviderId,
  listDefaultMessageForNotification: listDefaultMessageForNotification,
  sendNotificationForOSEvent: sendNotificationForOSEvent
};

function builderNotification(osObject, title, message, callback) {
  const providerId = osObject[0].PROVEDOR_ID;
  const customerId = osObject[0].CLIENTE_ID;
  let notificationObj = {};
  notificationObj.title = title;
  notificationObj.message = message;
  notificationObj.userId = customerId;
  notificationObj.blockNotification = "false";
  notificationObj.tags = [{}];
  notificationObj.tags[0].key = `${providerId}_${customerId}`;
  notificationObj.tags[0].relation = "=";
  notificationObj.tags[0].value = "1";
  createNotification(notificationObj, result => {
    //This is a parallel action, does not interfere with the flow, but we need to record if the notification was sent or not
    if (result.code == 200) {
      console.log("Notification sender");
    } else {
      console.log("Error try to send notification");
    }
  });
}
