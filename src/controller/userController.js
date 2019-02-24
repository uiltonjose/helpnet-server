const userDAO = require("../dao/userDAO");
const providerDAO = require("../dao/providerDAO");
require("dotenv").load();

const addUser = (user, callback) => {
  userDAO.addUser(user, (err, result) => {
    let resultResponse = {};
    if (!err) {
      resultResponse.code = 200;
      resultResponse.userId = result.insertId;
      resultResponse.message = "Usuário adicionado com sucesso.";
    } else {
      console.log({ err }); // Do not return this on response.
      resultResponse.code = 400;
      resultResponse.message = "Error ao adicionar o usuário.";
    }
    callback(resultResponse);
  });
};

const updateUserStatus = (user, callback) => {
  const confirmationCode = user.confirmationCode;
  const provedorId = user.provedorId;

  providerDAO.getByUserCode(confirmationCode, provedorId, function(
    err,
    result
  ) {
    console.log(result);
    if (err) {
      code = 400;
      message = "Error ao obter as informações do usuário.";
    } else {
      if (result == undefined || result == "") {
        let resultResponse = {};
        resultResponse.code = 403;
        resultResponse.message = "Código de confirmação inválido.";
        callback(resultResponse);
      } else {
        userDAO.updateUserStatus(user, err => {
          let resultResponse = {};
          if (!err) {
            resultResponse.code = 200;
            resultResponse.message = "Usuário atualizado com sucesso.";
          } else {
            resultResponse.code = 400;
            resultResponse.message = "Error ao atualizar o usuário.";
          }
          callback(resultResponse);
        });
      }
    }
  });
};

const getUserInfo = (userLogin, callback) => {
  if (userLogin === "undefined" || userLogin.trim() === "") {
    let resultResponse = {};
    resultResponse.code = 400;
    resultResponse.message = "Login inválido";
    callback(resultResponse);
    return;
  }

  userDAO.getUserInfo(userLogin, (err, result) => {
    const userObj = result[0];
    let resultResponse = {};
    let code, message;

    if (!err) {
      if (userObj !== undefined) {
        code = 200;
      } else {
        code = 404;
        message = "Usuário não encontrado.";
      }
    } else {
      code = 400;
      message = "Error ao obter as informações do usuário.";
    }

    resultResponse.code = code;
    resultResponse.message = message;
    resultResponse.userInfo = userObj;
    callback(resultResponse);
  });
};

const listUsers = callback => {
  userDAO.listUsers(function(err, result) {
    console.log("Listing all users");
    callback(err, result);
  });
};

module.exports = {
  addUser: addUser,
  updateUserStatus: updateUserStatus,
  getUserInfo: getUserInfo,
  listUsers: listUsers
};
