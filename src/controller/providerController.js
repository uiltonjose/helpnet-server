const providerDAO = require("../dao/providerDAO");
const StatusCode = require("../utils/StatusCode");

module.exports = {
  listAllProviders: function listAllProviders(callback) {
    providerDAO.listAllProviders((err, result) => {
      let resultResponse = {};
      if (!err) {
        resultResponse.code = StatusCode.status.Ok;
        resultResponse.message = result;
      } else {
        resultResponse.code = StatusCode.status.Bad_Request;
        resultResponse.message = "Something went wrong in your query.";
      }
      callback(resultResponse);
    });
  },
  //TODO Create Validation
  updateProvider: function updateProvider(provider, callback) {
    providerDAO.updateProvider(provider, err => {
      let resultResponse = {};
      if (!err) {
        resultResponse.code = StatusCode.status.Ok;
        resultResponse.message = "Provider updated with success";
      } else {
        resultResponse.code = StatusCode.status.Bad_Request;
        resultResponse.message = "Something went wrong in your query.";
      }
      callback(resultResponse);
    });
  },
  //TODO Create Validation
  addProvider: function addProvider(provider, callback) {
    providerDAO.addProvider(provider, err => {
      let resultResponse = {};
      if (!err) {
        resultResponse.code = StatusCode.status.Ok;
        resultResponse.message = "Provider created with success.";
      } else {
        resultResponse.code = StatusCode.status.Bad_Request;
        resultResponse.message = "Something went wrong in your query.";
      }
      callback(resultResponse);
    });
  }
};
