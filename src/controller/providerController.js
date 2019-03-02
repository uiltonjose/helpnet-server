const providerDAO = require("../dao/providerDAO");

module.exports = {
  listAllProviders: function listAllProviders(callback) {
    providerDAO.listAllProviders(err, result => {
      let resultResponse = {};
      if (!err) {
        resultResponse.code = 200;
        resultResponse.message = result;
      } else {
        resultResponse.code = 400;
        resultResponse.message = "Something went wrong you query.";
      }
      callback(resultResponse);
    });
  },
  //TODO Create Validation
  updateProvider: function updateProvider(provider, callback) {
    providerDAO.updateProvider(provider, err => {
      let resultResponse = {};
      if (!err) {
        resultResponse.code = 200;
        resultResponse.message = "Provider updated with success";
      } else {
        resultResponse.code = 400; // Bad request
        resultResponse.message = "Something went wrong you query.";
      }
      callback(resultResponse);
    });
  },
  //TODO Create Validation
  addProvider: function addProvider(provider, callback) {
    providerDAO.addProvider(provider, err => {
      let resultResponse = {};
      if (!err) {
        resultResponse.code = 200;
        resultResponse.message = "Provider created with success.";
      } else {
        resultResponse.code = 400;
        resultResponse.message = "Something went wrong you query.";
      }
      callback(resultResponse);
    });
  }
};
