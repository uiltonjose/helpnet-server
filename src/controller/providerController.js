const providerDAO = require("../dao/providerDAO");

module.exports = {
  listProviders: function listProviders(callback) {
    providerDAO.listProviders(function(err, result) {
      console.log("Lista de provedores", JSON.stringify(result));
      callback(err, result);
    });
  },

  updateProvider: function updateProvider(provider, callback) {
    providerDAO.updateProvider(provider, function(err, result) {
      let resultResponse = {};
      if (!err) {
        resultResponse.code = 204;
        resultResponse.message = "Provider atualizado com sucesso.";
      } else {
        resultResponse.code = 400; // Bad request
        resultResponse.message = "Error ao atualizar o Provedor.";
      }
      callback(resultResponse);
    });
  },

  addProvider: function addProvider(provider, callback) {
    providerDAO.addProvider(provider, function(err) {
      let resultResponse = {};
      if (!err) {
        resultResponse.code = 204;
        resultResponse.message = "Provedor adicionado com sucesso.";
      } else {
        resultResponse.code = 400;
        resultResponse.message = "Error ao adicionar o Provedor.";
      }
      callback(resultResponse);
    });
  }
};
