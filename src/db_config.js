const mysql = require("mysql");
const EncryptUtil = require("./utils/EncryptUtil");

const connection = mysql.createConnection({
  host: "lt80glfe2gj8p5n2.chr7pe7iynqr.eu-west-1.rds.amazonaws.com",
  user: "wnxoormb91xkfef9",
  password: "qmwan6b8lamtbp9j",
  database: "s0xdx9gvx8au1ooc"
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
  try {
    let connectionProvider = mysql.createConnection({
      host: provider.BD_URL,
      user: provider.BD_USUARIO,
      password: EncryptUtil.decryptString(provider.BD_SENHA),
      database: provider.BD_NOME
    });
    return connectionProvider;
  } catch (err) {
    console.log(err);
  }
};

module.exports = {
  getConnectionProvider: getConnectionProvider,
  getConnection: connection,
  executeQuery: executeQuery
};
