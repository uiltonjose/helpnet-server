const mysql = require("mysql");
const EncryptUtil = require("./utils/EncryptUtil");

const connection = mysql.createConnection({
  host: process.env.BD_HOST,
  user: process.env.BD_USER,
  password: process.env.BD_PASSWORD,
  database: process.env.BD_DATABASE
});

const executeQuery = sql => {
  return new Promise((resolve, reject) => {
    connection.query(sql, (err, result) => {
      if (err) {
        console.error(sql, err);
        reject(err);
      } else {
        resolve(result);
      }
    });
  });
};

const getConnectionProvider = provider => {
  let connectionProvider = mysql.createConnection({
    host: provider.BD_URL,
    user: provider.BD_USUARIO,
    password: EncryptUtil.decryptString(provider.BD_SENHA),
    database: provider.BD_NOME
  });
  return connectionProvider;
};

module.exports = {
  getConnectionProvider: getConnectionProvider,
  getConnection: connection,
  executeQuery: executeQuery
};
