const util = require("util"),
  mysql = require("mysql");
require("dotenv").load();

const connection = mysql.createConnection({
  host: process.env.BD_HOST,
  user: process.env.BD_USER,
  password: process.env.BD_PASSWORD,
  database: process.env.BD_DATABASE
});

//
//  Execute a Query when there is no transaction.
//
const runQuery = (sql, callback) => {
  connection.query(sql, (err, result) => {
    if (err) {
      console.error(sql, err);
    }
    callback(err, result);
  });
};

module.exports = {
  getConnectionProvider: function getConnectionProvider(provider) {
    let connectionProvider = mysql.createConnection({
      host: provider.BD_URL,
      user: provider.BD_USUARIO,
      password: provider.BD_SENHA,
      database: provider.BD_NOME
    });
    return connectionProvider;
  },
  getConnection: connection,
  runQuery: runQuery
};
