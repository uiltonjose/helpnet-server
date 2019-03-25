const contentDAO = require("../dao/contentDAO");
const StatusCode = require("../utils/StatusCode");

const getMinAppVersion = () => {
  return process.env.MIN_APP_VERSION;
};

const getServerDeployVersion = () => {
  const versionObj = {};
  versionObj.version = process.env.SERVER_VERSION;
  versionObj.lastDeployDate = process.env.DEPLOY_DATE;
  return versionObj;
};

module.exports = {
  boot: function boot(callback) {
    const boot = {};
    contentDAO.listAllProblemsOs(function(err, result) {
      if (!err) {
        boot.code = StatusCode.status.Ok;
        boot.listProblems = result;
        boot.minAppVersion = getMinAppVersion();
        boot.serverVersion = getServerDeployVersion();
        callback(boot);
      } else {
        boot.code = StatusCode.status.Bad_Request;
        boot.message = "Error getting Problem List.";
        callback(boot);
      }
    });
  },

  deployVersion: function deployVersion(callback) {
    callback(getServerDeployVersion());
  },

  listAllProblemsOs: function listAllProblemsOs(callback) {
    contentDAO.listAllProblemsOs(function(err, result) {
      let resultResponse = {};
      if (err) {
        resultResponse.code = StatusCode.status.Bad_Request;
        resultResponse.message = "Something went wrong in your query.";
      } else {
        resultResponse.code = StatusCode.status.Ok;
        resultResponse.message = result;
      }
      callback(resultResponse);
    });
  }
};
