const dbConfig = require("../db_config"),
  util = require("util");

const listAllProblemsOs = () => {
  const sql = util.format("SELECT * FROM problema_os");
  return dbConfig.executeQuery(sql);
};

module.exports = {
  listAllProblemsOs: listAllProblemsOs
};
