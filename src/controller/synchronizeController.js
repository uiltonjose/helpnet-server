const customerDAO = require("../dao/customerDAO"),
  providerDAO = require("../dao/providerDAO"),
  dateUtil = require("../utils/DateUtil"),
  StatusCode = require("../utils/StatusCode"),
  FileUtil = require("../utils/FileUtil.js");

const _ = require("lodash");

const handleFailRequest = (error, resolve) => {
  const responseObj = {};
  responseObj.code = StatusCode.status.Bad_Request;
  responseObj.message =
    "Problema na consulta dos dados do provedor, entre em contato com o administrador do sistema";
  responseObj.error = error;
  resolve(responseObj);
};

const matchCustomer = (customerOne, customerTwo) => {
  return _.isEqual(customerOne, customerTwo);
};

const synchronizeCustomer = (
  customersFromProvider,
  customersFromHelpnet,
  providerID
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

const synchronizeCustomersFromFilesAllProviders = () => {
  return new Promise(resolve => {
    providerDAO.listAllProviders().then(
      providers => {
        let promises = [];
        for (let i = 0; i < providers.length; i++) {
          promises.push(synchronizeCustomersFromFile(providers[i].ID));
        }
        Promise.all(promises).then(
          result => {
            resolve(result);
          },
          error => {
            resolve(error);
          }
        );
        /*
        const responseObj = {};
        responseObj.code = StatusCode.status.Ok;
        responseObj.message = "A sincronização foi finalizada com sucesso";
        resolve(responseObj);
        */
      },
      error => {
        console.error("Problema na sincronização dos dados", error);
        handleFailRequest(error, resolve);
      }
    );
  });
};

const synchronizeCustomersFromFile = providerID => {
  return new Promise(resolve => {
    customerDAO.getLocalCustomerFromProvider(providerID).then(
      customersFromHelpnet => {
        FileUtil.getCustomersFromFile(providerID)
          .then(
            customersFromProvider => {
              if (
                customersFromProvider !== undefined &&
                customersFromProvider[0] !== undefined
              ) {
                synchronizeCustomer(
                  customersFromProvider,
                  customersFromHelpnet,
                  providerID
                );
                let resultResponse = {};
                resultResponse.code = StatusCode.status.Ok;
                resultResponse.message = `Total de cliente localizados: ${
                  customersFromProvider.length
                }`;
                resolve(resultResponse);
              } else {
                resolve("Arquivo não encontrado ou arquivo vazio.");
              }
            },
            error => {
              handleFailRequest(error, resolve);
            }
          )
          .catch("Arquivo não encontrado ou arquivo vazio.");
      },
      error => {
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

module.exports = {
  synchronizeCustomersWithProviders: synchronizeCustomersWithProviders,
  loadBaseCustomerFromProvider: loadBaseCustomerFromProvider,
  synchronizeCustomersFromFilesAllProviders: synchronizeCustomersFromFilesAllProviders,
  synchronizeCustomersFromFile: synchronizeCustomersFromFile
};
