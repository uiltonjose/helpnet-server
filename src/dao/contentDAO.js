const connection = require("../db_config"),
  util = require("util");

module.exports = {
  listAllProblemsOs: function listAllProblemsOs(callback) {
    const sql = util.format("SELECT * FROM problema_os");
    connection.runQuery(sql, callback.bind(this));
  }
};
