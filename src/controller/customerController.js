const customerDAO = require("../dao/customerDAO"),
  StringUtil = require("../utils/StringUtil"),
  StatusCode = require("../utils/StatusCode");

const _ = require("lodash");

const buildResultProviderWithCustomers = (provider, customers, resolve) => {
  let finalResult = {};
  finalResult.provider = builderProviderResult(provider, resolve);
  finalResult.customer = customers;
  resolve(finalResult);
};

const builderProviderResult = (provider, resolve) => {
  if (provider === null || provider === undefined) {
    console.error("Provider Null or Undefined at builderProviderResult");
    handleFailRequest(resolve);
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
};

const handleFailRequest = (error, resolve) => {
  const responseObj = {};
  responseObj.code = StatusCode.status.Bad_Request;
  responseObj.message =
    "Problema na consulta dos dados do provedor, entre em contato com o administrador do sistema";
  responseObj.error = error;
  resolve(responseObj);
};

const userNotFound = (cpfCnpjCustomer, resolve) => {
  const response = {};
  response.code = StatusCode.status.Not_Found;
  response.message = "Customer not found. CPF/CNPJ: " + cpfCnpjCustomer;
  resolve(response);
};

/**
 * Recupera as informações atualizadas do cliente e do Provedor que o cliente está cadastrado
 */
const getProviderByCustomerCpfCnpjAndProviderCod = (
  cpfCnpjCustomer,
  providerCod
) => {
  return new Promise(resolve => {
    customerDAO.getLocalCustomer(cpfCnpjCustomer).then(
      customersFromHelpnet => {
        let providerID;
        if (
          typeof customersFromHelpnet !== "undefined" &&
          typeof customersFromHelpnet[0] !== "undefined"
        ) {
          console.log("O cliente foi localizado na base do Helpnet");
          providerID = customersFromHelpnet[0].PROVIDER_ID;
          if (typeof providerID !== "undefined") {
            customerDAO.getProviderData(providerID).then(
              dataProviders => {
                if (dataProviders !== undefined && dataProviders !== null) {
                  let interaction = 0;
                  buildResultProviderWithCustomers(
                    dataProviders[interaction],
                    customersFromHelpnet,
                    resolve
                  );
                } else {
                  noProviderFoundRequest(providerID, resolve);
                }
              },
              error => {
                console.log("Ocorreu um erro na consulta do provedor", err);
                handleFailRequest(error, resolve);
              }
            );
          } else {
            const error = {};
            error.error = "ProviderID is null or Undefined";
            handleFailRequest(error, resolve);
          }
        } else {
          console.log("O cliente NÃO foi localizado na base do Helpnet");
          handleUserNotFoundHelpnetDB(providerCod, cpfCnpjCustomer, resolve);
        }
      },
      error => {
        handleFailRequest(error, resolve);
      }
    );
  });
};

const handleUserNotFoundHelpnetDB = (providerCod, cpfCnpjCustomer, resolve) => {
  if (typeof providerCod !== "undefined") {
    customerDAO.getProviderDataByCod(providerCod).then(
      dataProvider => {
        if (dataProvider !== undefined && dataProvider[0] !== undefined) {
          let provider = dataProvider[0];
          customerDAO.getCustomerFromProvider(provider, cpfCnpjCustomer).then(
            customerResult => {
              if (customerResult !== null) {
                customerDAO.saveCustomer(customerResult[0], provider.ID).then(
                  result => {
                    customerResult[0].id = result.insertId;
                    buildResultProviderWithCustomers(
                      provider,
                      customerResult,
                      resolve
                    );
                  },
                  error => {
                    console.error(error);
                  }
                );
              } else {
                console.log(
                  "O cliente não foi localizado na base do Provedor."
                );
                userNotFound(cpfCnpjCustomer, resolve);
              }
            },
            error => {
              handleFailRequest(error, resolve);
            }
          );
        } else {
          noProviderFoundRequest(providerID, resolve);
        }
      },
      error => {
        console.log("Ocorreu um erro na consulta do provedor", err);
        handleFailRequest(error, resolve);
      }
    );
  } else {
    userNotFound(cpfCnpjCustomer, resolve);
  }
};

const noProviderFoundRequest = (providerID, resolve) => {
  const response = {};
  response.code = StatusCode.status.Not_Found;
  response.message = `Nenhum provedor foi encontrado com o id ${providerID}`;
  resolve(response);
};

const listAllCustomers = () => {
  return customerDAO.listAllCustomers();
};

const listCustomersByProviderId = providerId => {
  return new Promise(resolve => {
    let resultResponse = {};
    if (StringUtil.isNotValidNumber(providerId)) {
      resultResponse.code = StatusCode.status.Bad_Request;
      resultResponse.message = "Invalid Provider Id";
      resolve(resultResponse);
    } else {
      customerDAO.listCustomersByProviderId(providerId).then(
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
    }
  });
};

module.exports = {
  getProviderByCustomerCpfCnpjAndProviderCod: getProviderByCustomerCpfCnpjAndProviderCod,
  listAllCustomers: listAllCustomers,
  listCustomersByProviderId: listCustomersByProviderId
};
