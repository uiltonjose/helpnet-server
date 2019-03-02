const notificationDAO = require("../dao/notificationDAO");

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
  const req = https.request(options, function(res) {
    res.on("data", data => {
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
    let resultResponse = {};
    if (!err) {
      resultResponse.code = 200;
      resultResponse.message = notificationId;
      bodyData.data = data;
      sendNotification(bodyData, callback);
    } else {
      resultResponse.code = 400;
      resultResponse.message = "Error try to send notification";
    }
    callback(resultResponse);
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
        resultResponse.data = "Something went wrong you query.";
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
      resultResponse.data = "Something went wrong you query.";
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
      resultResponse.data = "Something went wrong you query.";
    }
    callback(resultResponse);
  });
};

module.exports = {
  createNotification: createNotification,
  updateNotificationAsRead: updateNotificationAsRead,
  listNotificationsByCustomerId: listNotificationsByCustomerId,
  listNotificationsByProviderId: listNotificationsByProviderId
};
