const mysql = require("mysql");
const EncryptUtil = require("./utils/EncryptUtil");

// const connection = mysql.createConnection({
//   host: process.env.BD_HOST,
//   user: process.env.BD_USER,
//   password: process.env.BD_PASSWORD,
//   database: process.env.BD_DATABASE
// });

var connection = mysql.createConnection({
  host: "lt80glfe2gj8p5n2.chr7pe7iynqr.eu-west-1.rds.amazonaws.com",
  user: "wnxoormb91xkfef9",
  password: "qmwan6b8lamtbp9j",
  database: "s0xdx9gvx8au1ooc"
});

/**@description Execute a Query when there is no transaction.
 * @param  {Sql that will be executed} sql
 * @param  {Callback expected to return the result} callback
 */
const runQuery = (sql, callback) => {
  connection.query(sql, (err, result) => {
    if (err) {
      console.error(sql, err);
    }
    callback(err, result);
  });
};

const runQueryNEW = sql => {
  return new Promise((resolve, reject) => {
    connection.query(sql, (err, result) => {
      if (err) {
        console.error(sql, err);
        reject(err);
      }
      resolve(result);
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
  runQuery: runQuery,
  runQueryNEW: runQueryNEW
};
