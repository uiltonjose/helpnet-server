const userDAO = require("../dao/userDAO");
const providerDAO = require("../dao/providerDAO");
const StringUtil = require("../utils/StringUtil");
require("dotenv").load();

const addUser = (user, callback) => {
  let resultResponse = {};
  if (StringUtil.isNullOrEmpty(user.login)) {
    resultResponse.code = 400;
    resultResponse.message = "Invalid User Id";
    callback(resultResponse);
  } else {
    userDAO.addUser(user, (err, result) => {
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
  }
};

const activateUserWithProvider = (user, callback) => {
  const confirmationCode = user.confirmationCode;
  const providerId = user.providerId;
  let resultResponse = {};
  if (StringUtil.isNotValidNumber(user.userId)) {
    resultResponse.code = 400;
    resultResponse.message = "Invalid User Id";
    callback(resultResponse);
  } else if (StringUtil.isNotValidNumber(user.confirmationCode)) {
    resultResponse.code = 400;
    resultResponse.message = "Invalid Confirmation Code";
    callback(resultResponse);
  } else if (StringUtil.isNotValidNumber(user.providerId)) {
    resultResponse.code = 400;
    resultResponse.message = "Invalid Provider Id";
    callback(resultResponse);
  } else {
    providerDAO.getProviderByProvedorIdAndConfirmationCode(
      confirmationCode,
      providerId,
      (err, result) => {
        if (err) {
          resultResponse.code = 400;
          resultResponse.message = "Something went wrong in your query.";
          console.log(resultResponse.message, err);
        } else {
          if (StringUtil.isNullOrEmpty(result)) {
            resultResponse.code = 403;
            resultResponse.message = "Invalid confirmation cod.";
            callback(resultResponse);
          } else {
            userDAO.activateUserWithProvider(user, err => {
              if (!err) {
                resultResponse.code = 200;
                resultResponse.message = "User successfully updated.";
              } else {
                resultResponse.code = 400;
                resultResponse.message = "Something went wrong in your query.";
                console.log(resultResponse.message, err);
              }
              callback(resultResponse);
            });
          }
        }
      }
    );
  }
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
      if (err) {
        resultResponse.code = 400;
        resultResponse.message = "Something went wrong in your query.";
      } else {
        const userObj = result[0];
        resultResponse.code = 200;
        resultResponse.userInfo = userObj;
      }
      callback(resultResponse);
    });
  }
};

//@Uil Não teve jeito para isso funcionar da forma acima
const listAllUsers = callback => {
  userDAO.listAllUsers((err, result) => {
    let resultResponse = {};
    if (!err) {
      resultResponse.code = 200;
      resultResponse.message = result;
      callback(resultResponse);
    } else {
      resultResponse.code = 400;
      resultResponse.message = "Something went wrong in your query.";
      callback(resultResponse);
    }
  });
};

module.exports = {
  addUser: addUser,
  activateUserWithProvider: activateUserWithProvider,
  getUserInfo: getUserInfo,
  listAllUsers: listAllUsers
};
