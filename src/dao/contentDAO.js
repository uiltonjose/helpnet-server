const connection = require("../db_config"),
  util = require("util");

const listAllProblemsOs = () => {
  const sql = util.format("SELECT * FROM problema_os");

  return new Promise((resolve, reject) => {
    connection
      .runQueryNEW(sql)
      .then(result => {
        resolve(result);
      })
      .catch(error => {
        reject(error);
      });
  });
};

module.exports = {
  listAllProblemsOs: listAllProblemsOs
};
