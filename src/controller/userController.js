const userDAO = require("../dao/userDAO");
const providerDAO = require("../dao/providerDAO");
const StringUtil = require("../utils/StringUtil");
const StatusCode = require("../utils/StatusCode");

const addUser = (user, callback) => {
  let resultResponse = {};
  if (StringUtil.isNullOrEmpty(user.login)) {
    resultResponse.code = StatusCode.status.Bad_Request;
    resultResponse.message = "Invalid User Id";
    callback(resultResponse);
  } else {
    userDAO.addUser(user, (err, result) => {
      if (!err) {
        resultResponse.code = StatusCode.status.Ok;
        resultResponse.userId = result.insertId;
        resultResponse.message = "User successfully created.";
      } else {
        resultResponse.code = StatusCode.status.Bad_Request;
        resultResponse.message = "Error adding user.";
      }
      callback(resultResponse);
    });
  }
};

const activateUserWithProvider = (user, callback) => {
  const confirmationCode = user.confirmationCode;
  const providerId = user.providerId;
  let resultResponse = {};
  if (StringUtil.isNotValidNumber(user.userId)) {
    resultResponse.code = StatusCode.status.Bad_Request;
    resultResponse.message = "Invalid User Id";
    callback(resultResponse);
  } else if (StringUtil.isNotValidNumber(user.confirmationCode)) {
    resultResponse.code = StatusCode.status.Bad_Request;
    resultResponse.message = "Invalid Confirmation Code";
    callback(resultResponse);
  } else if (StringUtil.isNotValidNumber(user.providerId)) {
    resultResponse.code = StatusCode.status.Bad_Request;
    resultResponse.message = "Invalid Provider Id";
    callback(resultResponse);
  } else {
    providerDAO.getProviderByProvedorIdAndConfirmationCode(
      confirmationCode,
      providerId,
      (err, result) => {
        if (err) {
          resultResponse.code = StatusCode.status.Bad_Request;
          resultResponse.message = "Something went wrong in your query.";
          console.log(resultResponse.message, err);
        } else {
          if (result && result.length > 0) {
            userDAO.activateUserWithProvider(user, err => {
              if (!err) {
                resultResponse.code = StatusCode.status.Ok;
                resultResponse.message = "User successfully updated.";
              } else {
                resultResponse.code = StatusCode.status.Bad_Request;
                resultResponse.message = "Something went wrong in your query.";
              }
              callback(resultResponse);
            });
          } else {
            resultResponse.code = StatusCode.status.Forbidden;
            resultResponse.message = "Invalid confirmation code.";
            callback(resultResponse);
          }
        }
      }
    );
  }
};

const getUserInfo = (userLogin, callback) => {
  if (StringUtil.isNullOrEmpty(userLogin)) {
    let resultResponse = {};
    resultResponse.code = StatusCode.status.Bad_Request;
    resultResponse.message = "Invalid login";
    callback(resultResponse);
  } else {
    userDAO.getUserInfo(userLogin, (err, result) => {
      let resultResponse = {};
      if (err) {
        resultResponse.code = StatusCode.status.Bad_Request;
        resultResponse.message = "Something went wrong in your query.";
      } else {
        const userObj = result[0];
        resultResponse.code = StatusCode.status.Ok;
        resultResponse.userInfo = userObj;
      }
      callback(resultResponse);
    });
  }
};

const listAllUsers = callback => {
  userDAO.listAllUsers((err, result) => {
    let resultResponse = {};
    if (!err) {
      resultResponse.code = StatusCode.status.Ok;
      resultResponse.message = result;
      callback(resultResponse);
    } else {
      resultResponse.code = StatusCode.status.Bad_Request;
      resultResponse.message = "Something went wrong in your query.";
      callback(resultResponse);
    }
  });
};

const listUserByProviderId = (providerId, callback) => {
  let resultResponse = {};
  if (StringUtil.isNotValidNumber(providerId)) {
    let resultResponse = {};
    resultResponse.code = StatusCode.status.Bad_Request;
    resultResponse.message = "Invalid Provider Id";
    callback(resultResponse);
  } else {
    userDAO.listUserByProviderId(providerId, (err, result) => {
      if (!err) {
        resultResponse.code = StatusCode.status.Ok;
        resultResponse.message = result;
        callback(resultResponse);
      } else {
        resultResponse.code = StatusCode.status.Bad_Request;
        resultResponse.message = "Something went wrong in your query.";
        callback(resultResponse);
      }
    });
  }
};

module.exports = {
  addUser: addUser,
  activateUserWithProvider: activateUserWithProvider,
  getUserInfo: getUserInfo,
  listAllUsers: listAllUsers,
  listUserByProviderId: listUserByProviderId
};
