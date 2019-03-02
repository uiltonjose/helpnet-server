const userDAO = require("../dao/userDAO");
const providerDAO = require("../dao/providerDAO");
const StringUtil = require("../utils/StringUtil");
require("dotenv").load();

//TODO Validate inputs
const addUser = (user, callback) => {
  userDAO.addUser(user, (err, result) => {
    let resultResponse = {};
    if (!err) {
      resultResponse.code = 200;
      resultResponse.userId = result.insertId;
      resultResponse.message = "User successfully created.";
    } else {
      resultResponse.code = 400;
      resultResponse.message = "Error adding user.";
    }
    callback(resultResponse);
  });
};
//TODO Validate inputs
const updateUserStatus = (user, callback) => {
  const confirmationCode = user.confirmationCode;
  const provedorId = user.provedorId;

  providerDAO.getProviderByProvedorIdAndConfirmationCode(
    confirmationCode,
    provedorId,
    (err, result) => {
      if (err) {
        code = 400;
        message = "Something went wrong you query.";
      } else {
        let resultResponse = {};
        if (StringUtil.isNullOrEmpty(result)) {
          resultResponse.code = 403;
          resultResponse.message = "Invalid confirmation cod.";
          callback(resultResponse);
        } else {
          userDAO.updateUserStatus(user, err => {
            if (!err) {
              resultResponse.code = 200;
              resultResponse.message = "User successfully updated.";
            } else {
              resultResponse.code = 400;
              resultResponse.message = "Something went wrong you query.";
            }
            callback(resultResponse);
          });
        }
      }
    }
  );
};

const getUserInfo = (userLogin, callback) => {
  if (StringUtil.isNullOrEmpty(userLogin)) {
    let resultResponse = {};
    resultResponse.code = 400;
    resultResponse.message = "Invalid login";
    callback(resultResponse);
  } else {
    userDAO.getUserInfo(userLogin, (err, result) => {
      let resultResponse = {};
      if (!err) {
        resultResponse.code = 200;
        resultResponse.message = result;
      } else {
        resultResponse.code = 400;
        resultResponse.message = "Something went wrong you query.";
      }
      callback(resultResponse);
    });
  }
};

const listAllUsers = callback => {
  userDAO.listAllUsers(err, result => {
    let resultResponse = {};
    if (!err) {
      resultResponse.code = 200;
      resultResponse.message = result;
    } else {
      resultResponse.code = 400;
      resultResponse.message = "Something went wrong you query.";
    }
    callback(resultResponse);
  });
};

module.exports = {
  addUser: addUser,
  updateUserStatus: updateUserStatus,
  getUserInfo: getUserInfo,
  listAllUsers: listAllUsers
};
