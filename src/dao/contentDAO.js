const connection = require("../db_config"),
  util = require("util");

module.exports = {
  listProblems: function listProblems(callback) {
    const sql = util.format("SELECT * FROM problema_os");
    connection.runQuery(sql, callback.bind(this));
  }
};
