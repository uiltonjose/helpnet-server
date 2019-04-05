const userDAO = require("../dao/userDAO");
const providerDAO = require("../dao/providerDAO");
const StringUtil = require("../utils/StringUtil");
const StatusCode = require("../utils/StatusCode");

const addUser = user => {
  return new Promise(resolve => {
    let resultResponse = {};

    if (StringUtil.isNullOrEmpty(user.login)) {
      resultResponse.code = StatusCode.status.Bad_Request;
      resultResponse.message = "Invalid User Id";
      resolve(resultResponse);
    } else {
      userDAO
        .addUser(user)
        .then(result => {
          resultResponse.code = StatusCode.status.Ok;
          resultResponse.userId = result.insertId;
          resultResponse.message = "User successfully created.";
          resolve(resultResponse);
        })
        .catch(err => {
          resultResponse.code = StatusCode.status.Bad_Request;
          resultResponse.message = "Error adding user.";
          resultResponse.error = err;
          resolve(resultResponse);
        });
    }
  });
};

const activateUserWithProvider = user => {
  return new Promise(resolve => {
    const { confirmationCode, providerId, userId } = user;
    let resultResponse = {};
    resultResponse.code = StatusCode.status.Bad_Request;

    if (StringUtil.isNotValidNumber(userId)) {
      resultResponse.message = "Invalid User Id";
      resolve(resultResponse);
    } else if (StringUtil.isNotValidNumber(confirmationCode)) {
      resultResponse.message = "Invalid Confirmation Code";
      resolve(resultResponse);
    } else if (StringUtil.isNotValidNumber(providerId)) {
      resultResponse.message = "Invalid Provider Id";
      resolve(resultResponse);
    } else {
      providerDAO
        .getProviderByProvedorIdAndConfirmationCode(
          confirmationCode,
          providerId
        )
        .then(
          result => {
            if (result && result.length > 0) {
              userDAO.activateUserWithProvider(user).then(
                () => {
                  resultResponse.code = StatusCode.status.Ok;
                  resultResponse.message = "User successfully updated.";
                  resolve(resultResponse);
                },
                updateError => {
                  resultResponse.message =
                    "It was not possible to activate the user";
                  resultResponse.error = updateError;
                  resolve(resultResponse);
                }
              );
            } else {
              resultResponse.code = StatusCode.status.Forbidden;
              resultResponse.message = "Invalid confirmation code.";
              resolve(resultResponse);
            }
          },
          error => {
            resultResponse.code = StatusCode.status.Internal_Server_Error;
            resultResponse.message = "Something went wrong in your query.";
            resultResponse.error = error;
            resolve(resultResponse);
          }
        );
    }
  });
};

const getUserInfo = userLogin => {
  let resultResponse = {};

  return new Promise(resolve => {
    if (StringUtil.isNullOrEmpty(userLogin)) {
      resultResponse.code = StatusCode.status.Bad_Request;
      resultResponse.message = "Invalid login";
      resolve(resultResponse);
    } else {
      userDAO.getUserInfo(userLogin).then(
        result => {
          const userObj = result[0];
          resultResponse.code = StatusCode.status.Ok;
          resultResponse.userInfo = userObj;
          resolve(resultResponse);
        },
        error => {
          resultResponse.code = StatusCode.status.Bad_Request;
          resultResponse.message = "Something went wrong in your query.";
          resultResponse.error = error;
          resolve(resultResponse);
        }
      );
    }
  });
};

const listAllUsers = () => {
  let resultResponse = {};

  return new Promise(resolve => {
    userDAO.listAllUsers().then(
      result => {
        resultResponse.code = StatusCode.status.Ok;
        resultResponse.message = result;
        resolve(resultResponse);
      },
      error => {
        resultResponse.code = StatusCode.status.Bad_Request;
        resultResponse.message = "Something went wrong in your query.";
        resultResponse.error = error;
        resolve(resultResponse);
      }
    );
  });
};

const listUserByProviderId = providerId => {
  return new Promise(resolve => {
    let resultResponse = {};
    if (StringUtil.isNotValidNumber(providerId)) {
      let resultResponse = {};
      resultResponse.code = StatusCode.status.Bad_Request;
      resultResponse.message = "Invalid Provider Id";
      resolve(resultResponse);
    } else {
      userDAO.listUserByProviderId(providerId).then(
        result => {
          resultResponse.code = StatusCode.status.Ok;
          resultResponse.message = result;
          resolve(resultResponse);
        },
        error => {
          resultResponse.code = StatusCode.status.Bad_Request;
          resultResponse.message = "Something went wrong in your query.";
          resultResponse.error = error;
          resolve(resultResponse);
        }
      );
    }
  });
};

module.exports = {
  addUser: addUser,
  activateUserWithProvider: activateUserWithProvider,
  getUserInfo: getUserInfo,
  listAllUsers: listAllUsers,
  listUserByProviderId: listUserByProviderId
};
