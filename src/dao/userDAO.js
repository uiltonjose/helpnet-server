const dbConfig = require("../db_config"),
  util = require("util");

const addUser = (user, callback) => {
  //TODO: Falta verificar se não existe o user cadastrado. Em tese isto nunca vai acontecer, pois o Firebase bloqueia.
  const sql = util.format(
    "INSERT INTO usuario (login, perfil, status) VALUES ('%s', '%s', '%s')",
    user.login,
    "Provedor",
    "Pendente"
  );

  dbConfig.getConnection.query(sql, (err, result) => {
    callback(err, result);
  });
};

const updateUserStatus = (user, callback) => {
  const sql = util.format(
    "UPDATE usuario SET status = '%s', provedor_id = '%s' WHERE id = '%s'",
    "Ativo",
    user.provedorId,
    user.userId
  );

  dbConfig.getConnection.query(sql, err => {
    callback(err);
  });
};

const getUserInfo = (userLogin, callback) => {
  const sql = util.format(
    "SELECT * FROM usuario WHERE login = '%s'",
    userLogin
  );

  dbConfig.runQuery(sql, callback.bind(this));
};

const listUsers = callback => {
  const sql = util.format("SELECT * FROM usuario");
  dbConfig.runQuery(sql, callback.bind(this));
};

module.exports = {
  addUser: addUser,
  updateUserStatus: updateUserStatus,
  getUserInfo: getUserInfo,
  listUsers: listUsers
};
