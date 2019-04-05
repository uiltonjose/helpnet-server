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

const boot = () => {
  return new Promise((resolve, reject) => {
    const boot = {};
    contentDAO
      .listAllProblemsOs()
      .then(result => {
        boot.code = StatusCode.status.Ok;
        boot.listProblems = result;
        boot.minAppVersion = getMinAppVersion();
        boot.serverVersion = getServerDeployVersion();
        resolve(boot);
      })
      .catch(err => {
        boot.code = StatusCode.status.Bad_Request;
        boot.message = "Error getting Problem List.";
        boot.error = err;
        reject(boot);
      });
  });
};

module.exports = {
  boot: boot
};
