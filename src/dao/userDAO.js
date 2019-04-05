const dbConfig = require("../db_config"),
  util = require("util");

const addUser = user => {
  //TODO: Falta verificar se não existe o user cadastrado. Em tese isto nunca vai acontecer, pois o Firebase bloqueia.
  const sql = util.format(
    "INSERT INTO usuario (login, perfil, status) VALUES ('%s', '%s', '%s')",
    user.login,
    "Provedor",
    "Pendente"
  );

  return dbConfig.executeQuery(sql);
};

const activateUserWithProvider = user => {
  const sql = util.format(
    "UPDATE usuario SET status = '%s', provedor_id = '%s' WHERE id = '%s'",
    "Ativo",
    user.providerId,
    user.userId
  );

  return dbConfig.executeQuery(sql);
};

const getUserInfo = userLogin => {
  const sql = util.format(
    "SELECT * FROM usuario WHERE login = '%s'",
    userLogin
  );
  return dbConfig.executeQuery(sql);
};

const listAllUsers = callback => {
  const sql = util.format("SELECT * FROM usuario");
  return dbConfig.executeQuery(sql);
};

const listUserByProviderId = providerId => {
  const sql = util.format(
    "SELECT * FROM usuario WHERE provedor_id = %s",
    providerId
  );
  return dbConfig.executeQuery(sql);
};

module.exports = {
  addUser: addUser,
  activateUserWithProvider: activateUserWithProvider,
  getUserInfo: getUserInfo,
  listAllUsers: listAllUsers,
  listUserByProviderId: listUserByProviderId
};
