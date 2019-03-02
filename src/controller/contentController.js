const contentDAO = require("../dao/contentDAO");
require("dotenv").load();

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
        boot.code = 200;
        boot.listProblems = result;
        boot.minAppVersion = getMinAppVersion();
        boot.serverVersion = getServerDeployVersion();
        callback(boot);
      } else {
        boot.code = 400;
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
        resultResponse.code = 400;
        resultResponse.message = "Something went wrong you query.";
      } else {
        resultResponse.code = 200;
        resultResponse.message = result;
      }
      callback(resultResponse);
    });
  }
};
