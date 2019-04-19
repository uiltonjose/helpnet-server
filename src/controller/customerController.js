const customerDAO = require("../dao/customerDAO"),
  providerDAO = require("../dao/providerDAO"),
  dateUtil = require("../utils/DateUtil"),
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

const matchCustomer = (customerOne, customerTwo) => {
  return _.isEqual(customerOne, customerTwo);
};

const synchronizeCustomer = (
  customersFromProvider,
  customersFromHelpnet,
  providerID,
  resolve
) => {
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
          customerDAO.updateCustomer(customerFromProvider).then(
            () => {
              customerUpdated = true;
            },
            error => {
              customerUpdated = false;
              console.error(
                `Problema na atualização dos dados do cliente ${
                  customerFromProvider.cpf_cnpj
                }`
              );
            }
          );
        }
      }
      countCustomerFromHelpnet++;
    }

    if (!customerExistInHelpnet) {
      customerDAO.saveCustomer(customerFromProvider, providerID);
    }
    countCustomerFromProvider++;
  }

  resolve(
    dateUtil.getDateString() +
      " - Finalizada a sincronização da base de dados do provedor " +
      providerID
  );
};

const listAllCustomers = () => {
  return customerDAO.listAllCustomers();
};

const synchronizeCustomersWithProviders = () => {
  return new Promise(resolve => {
    providerDAO.listAllProviders().then(
      providers => {
        for (let i = 0; i < providers.length; i++) {
          loadBaseCustomerFromProvider(providers[i].ID);
        }
        resolve(
          "A sincronização foi iniciada, para mais detalhes verifique o log"
        );
      },
      error => {
        console.error("Problema na sincronização dos dados", error);
        handleFailRequest(error, resolve);
      }
    );
  });
};

const loadBaseCustomerFromProvider = providerID => {
  return new Promise(resolve => {
    customerDAO.getLocalCustomerFromProvider(providerID).then(
      customersFromHelpnet => {
        if (
          typeof customersFromHelpnet !== "undefined" &&
          typeof customersFromHelpnet[0] !== "undefined"
        ) {
          console.log(
            `Foram identificados clientes na base do Helpnet para provedor ${providerID}`
          );
        } else {
          console.log(
            `Não foram localizados clientes para o provedor ${providerID} na base do Helpnet`,
            customersFromHelpnet
          );
        }
        customerDAO.getProviderData(providerID).then(
          providers => {
            if (typeof providers !== undefined) {
              let totalInteration = providers.length;
              let interation = 0;
              // Consulta a base do primeiro provedor para buscar as informações do cliente, quando não encontra,
              // entra em loop buscando nos outros provedores, até encontrar ou percorrer todos os provedores
              customerDAO
                .getCustomersFromProviderId(
                  interation,
                  totalInteration,
                  providers
                )
                .then(
                  response => {
                    const provider = providers[response.interaction];
                    const customersFromProvider =
                      response.customersFromProvider;
                    if (
                      typeof customersFromProvider !== "undefined" &&
                      typeof customersFromProvider[0] !== "undefined"
                    ) {
                      synchronizeCustomer(
                        customersFromProvider,
                        customersFromHelpnet,
                        provider.ID,
                        resolve
                      );
                    } else {
                      resolve("Nenhum cliente encontrado na base do provedor");
                    }
                  },
                  error => {
                    // Quando ocorre problema na consulta dos provedores, será retornado o cliente da base do Helpnet
                    console.log(error);

                    const errorResponse = {};
                    errorResponse.message =
                      "Não foi possível consultar no provedor";
                    errorResponse.error = error;
                    resolve(errorResponse);
                  }
                );
            } else {
              handleFailRequest(
                "Problema na consulta dos dados dos provedores",
                resolve
              );
            }
          },
          error => {
            console.error("Ocorreu um erro na consulta do provedor", error);
            handleFailRequest(error, resolve);
          }
        );
      },
      error => {
        handleFailRequest(error, resolve);
      }
    );
  });
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
  synchronizeCustomersWithProviders: synchronizeCustomersWithProviders,
  loadBaseCustomerFromProvider: loadBaseCustomerFromProvider,
  listAllCustomers: listAllCustomers,
  listCustomersByProviderId: listCustomersByProviderId
};
