const providerDAO = require("../dao/providerDAO");
const StatusCode = require("../utils/StatusCode");
const StringUtil = require("../utils/StringUtil");

const listAllProviders = () => {
  return new Promise(resolve => {
    let resultResponse = {};
    providerDAO.listAllProviders().then(
      result => {
        resultResponse.code = StatusCode.status.Ok;
        resultResponse.message = result;
        resolve(resultResponse);
      },
      error => {
        resultResponse.code = StatusCode.status.Bad_Request;
        resultResponse.message = "Something went wrong in your query.";
        resultResponse.error = error;
        resolve(resultResponse);
      }
    );
  });
};

const updateProvider = provider => {
  return new Promise(resolve => {
    let resultResponse = {};
    providerDAO.updateProvider(provider).then(
      () => {
        resultResponse.code = StatusCode.status.Ok;
        resultResponse.message = "Provider updated with success";
        resolve(resultResponse);
      },
      error => {
        resultResponse.code = StatusCode.status.Bad_Request;
        resultResponse.message = "Something went wrong in your query.";
        resultResponse.error = error;
        resolve(resultResponse);
      }
    );
  });
};

const addProvider = provider => {
  return new Promise(resolve => {
    let resultResponse = {};

    providerDAO.addProvider(provider).then(
      () => {
        resultResponse.code = StatusCode.status.Ok;
        resultResponse.message = "Provider created with success.";
        resolve(resultResponse);
      },
      error => {
        resultResponse.code = StatusCode.status.Bad_Request;
        resultResponse.message = "Something went wrong in your query.";
        resultResponse.error = error;
        resolve(resultResponse);
      }
    );
  });
};

const getProviderById = providerId => {
  return new Promise(resolve => {
    let resultResponse = {};
    resultResponse.code = StatusCode.status.Bad_Request;

    if (StringUtil.isNotValidNumber(providerId)) {
      resultResponse.message = "Invalid Provider ID.";
      resolve(resultResponse);
      return;
    }

    providerDAO.getProviderById(providerId).then(
      result => {
        resultResponse.code = StatusCode.status.Ok;
        resultResponse.message = result;
        resolve(resultResponse);
      },
      error => {
        resultResponse.message = "Something went wrong in your query.";
        resultResponse.error = error;
        resolve(resultResponse);
      }
    );
  });
};

module.exports = {
  listAllProviders: listAllProviders,
  updateProvider: updateProvider,
  addProvider: addProvider,
  getProviderById: getProviderById
};
