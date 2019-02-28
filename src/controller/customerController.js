const customerDAO = require("../dao/customerDAO"),
  providerDAO = require("../dao/providerDAO"),
  dateUtil = require("../utils/DateUtil");

function buildResultProviderWithCustomers(provider, customers, callback) {
  let finalResult = {};
  finalResult.provider = builderProviderResult(provider, callback);
  finalResult.customer = customers;
  return finalResult;
}

function builderProviderResult(provider, callback) {
  if (provider === null || provider === undefined) {
    console.error("Provider Null or Undefined at builderProviderResult");
    handleFailRequest(callback);
    return;
  }

  let providerResult = {};
  providerResult.ID = provider.ID;
  providerResult.NOME = provider.NOME;
  providerResult.DESCRICAO = provider.DESCRICAO;
  providerResult.SITUACAO = provider.SITUACAO;
  providerResult.EMAIL = provider.EMAIL;
  providerResult.TELEFONE_CONTATO = provider.TELEFONE_CONTATO;
  providerResult.CELULAR_CONTATO = provider.CELULAR_CONTATO;
  providerResult.LOGO = provider.LOGO;
  providerResult.CODIGO = provider.CODIGO;
  return providerResult;
}

function handleFailRequest(callback) {
  const responseObj = {};
  responseObj.code = 400;
  responseObj.message =
    "Problema na consulta dos dados do provedor, entre em contato com o administrador do sistema";
  callback(responseObj);
}

function userNotFound(cpfCnpjCustomer, callback) {
  const response = {};
  response.code = 404;
  response.message = "Customer not found. CPF/CNPJ: " + cpfCnpjCustomer;
  callback(response);
}

const methods = (module.exports = {
  //
  // Recupera as informações atualizadas do cliente e do Provedor que o cliente está cadastrado
  //
  getProviderByCustomerID: function getProviderByCustomerID(
    cpfCnpjCustomer,
    providerCod,
    callback
  ) {
    customerDAO.getLocalCustomer(cpfCnpjCustomer, function(
      err,
      customersFromHelpnet
    ) {
      let providerID;
      if (
        typeof customersFromHelpnet !== "undefined" &&
        typeof customersFromHelpnet[0] !== "undefined"
      ) {
        console.log("O cliente foi localizado na base do Helpnet");
        providerID = customersFromHelpnet[0].PROVIDER_ID;
        if (typeof providerID !== "undefined") {
          customerDAO.getProviderData(providerID, function(err, dataProviders) {
            if (err) {
              console.log("Ocorreu um erro na consulta do provedor", err);
              handleFailRequest(callback);
            } else {
              if (dataProviders !== undefined && dataProviders !== null) {
                let interaction = 0;
                let finalResult = buildResultProviderWithCustomers(
                  dataProviders[interaction],
                  customersFromHelpnet,
                  callback
                );
                callback(finalResult);
              } else {
                console.log(
                  "Nenhum provedor foi encontrado com o id " + providerID
                );
                handleFailRequest(callback);
              }
            }
          });
        } else {
          handleFailRequest(callback);
        }
      } else {
        console.log("O cliente NÃO foi localizado na base do Helpnet");
        if (typeof providerCod !== "undefined") {
          customerDAO.getProviderDataByCod(providerCod, function(
            err,
            dataProvider
          ) {
            if (err) {
              console.log("Ocorreu um erro na consulta do provedor", err);
              handleFailRequest(callback);
            } else {
              if (dataProvider !== undefined && dataProvider[0] !== undefined) {
                let provider = dataProvider[0];
                customerDAO.getCustomerFromProvider(
                  provider,
                  cpfCnpjCustomer,
                  function(err, customerResult) {
                    if (
                      customerResult !== undefined &&
                      customerResult !== null
                    ) {
                      customerDAO.saveCustomer(
                        customerResult[0],
                        provider.ID,
                        function(err, result) {
                          customerResult[0].id = result.insertId;
                          const finalResult = buildResultProviderWithCustomers(
                            provider,
                            customerResult
                          );
                          callback(finalResult);
                        }
                      );
                    } else {
                      console.log(
                        "O cliente não foi localizado na base do Provedor."
                      );
                      userNotFound(cpfCnpjCustomer, callback);
                    }
                  }
                );
              } else {
                console.log(
                  "Nenhum provedor foi encontrado com o id " + providerID
                );
                handleFailRequest(callback);
              }
            }
          });
        } else {
          userNotFound(cpfCnpjCustomer, callback);
        }
      }
    });
  },

  synchronizeCustomersWithProviders: function synchronizeCustomersWithProviders(
    callback
  ) {
    providerDAO.listProviders(function(err, providers) {
      if (err) {
        console.log("Problema na sincronização dos dados");
        console.log(err);
        callback(err, "Problema na sincronização dos dados");
      } else {
        for (let i = 0; i < providers.length; i++) {
          methods.loadBaseCustomerFromProvider(providers[i].ID, function(
            err,
            result
          ) {
            console.log(result);
          });
        }
        callback(
          err,
          "A sincronização foi iniciada, para mais detalhes verifique o log"
        );
      }
    });
  },

  loadBaseCustomerFromProvider: function loadBaseCustomerFromProvider(
    providerID,
    callback
  ) {
    customerDAO.getLocalCustomerFromProvider(providerID, function(
      err,
      customersFromHelpnet
    ) {
      if (
        typeof customersFromHelpnet !== "undefined" &&
        typeof customersFromHelpnet[0] !== "undefined"
      ) {
        console.log(
          "Foram identificados clientes na base do Helpnet para provedor " +
            providerID
        );
      } else {
        console.log(
          "Não foram localizados clientes para o provedor " +
            providerID +
            " na base do Helpnet"
        );
      }
      customerDAO.getProviderData(providerID, function(err, providers) {
        if (err) {
          console.log("Ocorreu um erro na consulta do provedor");
          console.log(err);
        } else {
          if (typeof providers !== undefined) {
            let totalInteration = providers.length;
            let interation = 0;
            // Consulta a base do primeiro provedor para buscar as informações do cliente, quando não encontra,
            // entra em loop buscando nos outros provedores, até encontrar ou percorrer todos os provedores
            customerDAO.getCustomersFromProviderId(
              interation,
              totalInteration,
              providers,
              function(err, customersFromProvider, providerPosition) {
                let provider = providers[providerPosition];
                if (err) {
                  // Quando ocorre problema na consulta dos provedores, será retornado o cliente da base do Helpnet
                  console.log("Não foi possível consultar no provedor");
                } else {
                  if (
                    typeof customersFromProvider !== "undefined" &&
                    typeof customersFromProvider[0] !== "undefined"
                  ) {
                    synchronizeCustomer(
                      customersFromProvider,
                      customersFromHelpnet,
                      provider.ID,
                      function(err, result) {
                        callback(err, result);
                      }
                    );
                  } else {
                    callback(
                      err,
                      "Nenhum cliente encontrado na base do provedor"
                    );
                  }
                }
              }
            );
          } else {
            callback(err, "Problema na consulta dos dados dos provedores");
          }
        }
      });
    });
  },

  listClients: function listClients(callback) {
    customerDAO.listClients(function(err, result) {
      callback(err, result);
    });
  },

  listByProviderId: function listByProviderId(providerId, callback) {
    if (StringUtil.isInvalidNumer(providerId)) {
      resultResponse.code = 400;
      resultResponse.message = "Invalid Provider Id";
      callback(resultResponse);
    } else {
      customerDAO.listByProviderId(providerId, (err, result) => {
        let resultResponse = {};
        resultResponse.code = 400;
        resultResponse.message = result;
        callback(err, resultResponse);
      });
    }
  }
});

function matchCustomer(customerOne, customerTwo) {
  if (customerOne.nome == null) customerOne.nome = "null";
  if (customerOne.cpf_cnpj === null) customerOne.cpf_cnpj = "null";
  if (customerOne.nome_res === null) customerOne.nome_res = "null";
  if (customerOne.fone === null) customerOne.fone = "null";
  if (customerOne.celular === null) customerOne.celular = "null";
  if (customerOne.login === null) customerOne.login = "null";
  if (customerOne.email === null) customerOne.email = "null";
  if (customerOne.endereco === null) customerOne.endereco = "null";
  if (customerOne.numero === null) customerOne.numero = "null";
  if (customerOne.complemento === null) customerOne.complemento = "null";
  if (customerOne.bairro === null) customerOne.bairro = "null";
  if (customerOne.cidade === null) customerOne.cidade = "null";
  if (customerOne.estado === null) customerOne.estado = "null";
  if (customerOne.cep === null) customerOne.cep = "null";
  if (customerOne.bloqueado === null) customerOne.bloqueado = "null";
  if (customerOne.cli_ativado === null) customerOne.cli_ativado = "null";
  if (customerOne.login === null) customerOne.login = "null";
  if (customerOne.plano === null) customerOne.plano = "null";
  if (customerOne.cadastro === null) customerOne.cadastro = "null";

  if (
    customerOne.nome == customerTwo.nome &&
    customerOne.nome_res == customerTwo.nome_res &&
    customerOne.fone == customerTwo.fone &&
    customerOne.celular == customerTwo.celular &&
    customerOne.email == customerTwo.email &&
    customerOne.endereco == customerTwo.endereco &&
    customerOne.numero == customerTwo.numero &&
    customerOne.complemento == customerTwo.complemento &&
    customerOne.bairro == customerTwo.bairro &&
    customerOne.cidade == customerTwo.cidade &&
    customerOne.estado == customerTwo.estado &&
    customerOne.cep == customerTwo.cep &&
    customerOne.bloqueado == customerTwo.bloqueado &&
    customerOne.cli_ativado == customerTwo.cli_ativado &&
    customerOne.login == customerTwo.login &&
    customerOne.cadastro == customerTwo.cadastro &&
    customerOne.plano == customerTwo.plano
  ) {
    return true;
  } else {
    return false;
  }
}

function synchronizeCustomer(
  customersFromProvider,
  customersFromHelpnet,
  providerID,
  callback
) {
  let countCustomerFromProvider = 0;
  while (countCustomerFromProvider < customersFromProvider.length) {
    let customerFromProvider = customersFromProvider[countCustomerFromProvider];
    let customerExistInHelpnet = false;
    let customerUpdated = false;
    let countCustomerFromHelpnet = 0;
    while (
      countCustomerFromHelpnet < customersFromHelpnet.length &&
      !customerUpdated
    ) {
      let customerFromHelpnet = customersFromHelpnet[countCustomerFromHelpnet];
      if (
        customerFromProvider.cpf_cnpj == customerFromHelpnet.cpf_cnpj &&
        customerFromProvider.login == customerFromHelpnet.login
      ) {
        customerExistInHelpnet = true;
        if (!matchCustomer(customerFromHelpnet, customerFromProvider)) {
          customerFromProvider.id = customerFromHelpnet.id;
          customerDAO.updateCustomer(customerFromProvider);
        }
        customerUpdated = true;
      }
      countCustomerFromHelpnet++;
    }
    if (!customerExistInHelpnet) {
      customerDAO.saveCustomer(customerFromProvider, providerID);
    }
    countCustomerFromProvider++;
  }

  callback(
    false,
    dateUtil.getDateString() +
      " - Finalizada a sincronização da base de dados do provedor " +
      providerID
  );
}
