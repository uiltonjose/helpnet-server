const dbConfig = require("../db_config"),
  util = require("util"),
  Enum = require("../model/Enum");

const updateCustomerOpenOS = (blockOpenNewOS, customerId) => {
  const sql = util.format(
    `UPDATE cliente SET bloqueio_abrir_os ='%s' WHERE ID = %d`,
    blockOpenNewOS,
    customerId
  );

  return dbConfig.executeQuery(sql);
};

const listAllCustomers = () => {
  const sql = util.format("SELECT * FROM cliente");
  return dbConfig.executeQuery(sql);
};

const listCustomersByProviderId = providerId => {
  const sql = util.format(
    `SELECT id as Ident, nome as Nome, cpf_cnpj as 'CPF/CNPJ', celular as Celular, login as Login, endereco as Endereço, complemento as Complemento, bairro as Bairro, plano as Plano
      FROM cliente WHERE PROVIDER_ID = %s AND bloqueado = 'nao' AND cli_ativado = 's'`,
    providerId
  );

  return dbConfig.executeQuery(sql);
};

/**
 * Consulta dos clientes na base do Provedor
 */
const getCustomersFromProviderId = (
  interaction,
  totalInteraction,
  providers
) => {
  return new Promise((resolve, reject) => {
    const provider = providers[interaction];
    const table = provider.BD_TABLE;
    const select = provider.BD_SELECT;
    const connectionProvider = dbConfig.getConnectionProvider(provider);

    const sqlProvider = util.format("%s FROM %s ", select, table);

    connectionProvider.query(sqlProvider, (error, customersFromProvider) => {
      if (error) {
        console.error(
          `Ocorreu um erro na consulta a base do provedor ${provider.ID}`,
          error
        );
        reject({
          error: `Ocorreu um erro na consulta a base do provedor ${
            provider.ID
          }`,
          error
        });
      }

      if (
        typeof customersFromProvider !== "undefined" &&
        typeof customersFromProvider[0] !== "undefined"
      ) {
        const response = {};
        response.customersFromProvider = customersFromProvider;
        response.interaction = interaction;
        resolve(response);
      } else {
        interaction++;
        if (totalInteraction > interaction) {
          getCustomersFromProviderId(
            interaction,
            totalInteraction,
            providers
          ).then(
            result => {
              const response = {};
              response.customersFromProvider = result;
              response.interaction = interaction;
              resolve(response);
            },
            error => {
              reject(error);
            }
          );
        } else {
          resolve(null);
        }
      }
    });
  });
};

/**
 * Consulta de um cliente na base do Provedor
 */
const getCustomerFromProvider = (provider, cpf_cnpj) => {
  return new Promise((resolve, reject) => {
    const table = provider.BD_TABLE;
    const select = provider.BD_SELECT;
    const connectionProvider = dbConfig.getConnectionProvider(provider);
    const sqlProvider = util.format(
      "%s FROM %s WHERE cpf_cnpj = %s",
      select,
      table,
      cpf_cnpj
    );
    try {
      connectionProvider.query(sqlProvider, (error, customersFromProvider) => {
        if (error) {
          console.error(
            "Ocorreu um erro na consulta a base do provedor" + provider.ID,
            error
          );
          reject(error);
        }

        if (
          typeof customersFromProvider !== "undefined" &&
          typeof customersFromProvider[0] !== "undefined"
        ) {
          resolve(customersFromProvider);
        } else {
          resolve(null);
        }
      });
    } catch (err) {
      console.log(err);
      reject(err);
    }
  });
};

const getProviderData = providerId => {
  const sql = util.format(
    `SELECT * FROM provedor WHERE ID = %d AND SITUACAO = '${
      Enum.State.ACTIVE
    }'`,
    providerId
  );

  return dbConfig.executeQuery(sql);
};

const getProviderDataByCod = providerCod => {
  const sql = util.format(
    `SELECT * FROM provedor WHERE CODIGO_CLIENTE = %d AND SITUACAO = '${
      Enum.State.ACTIVE
    }'`,
    providerCod
  );
  return dbConfig.executeQuery(sql);
};

/**
 * Localiza o cliente na base do Helpnet
 */
const getLocalCustomerFromProvider = providerID => {
  const sql = util.format(
    `SELECT * FROM cliente WHERE PROVIDER_ID = '%s'`,
    providerID
  );

  return dbConfig.executeQuery(sql);
};

/**
 * Localiza o cliente na base do Helpnet
 */
const getLocalCustomer = cpfCustomer => {
  const sql = util.format(
    `SELECT * FROM cliente WHERE cpf_cnpj = '%s'`,
    cpfCustomer
  );
  return dbConfig.executeQuery(sql);
};

const saveCustomer = (customer, idProvider) => {
  const sql = util.format(
    `INSERT INTO cliente (nome, cpf_cnpj, nome_res, fone, celular, login, email, endereco, 
      numero, complemento, bairro, cidade, estado, cep, bloqueado, cli_ativado, plano, PROVIDER_ID, cadastro, data_inclusao) 
      VALUES ('%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s','%s','%s','%s','%s','%s','%s','%s','%s','%s', %s, '%s', NOW())`,
    customer.nome,
    customer.cpf_cnpj,
    customer.nome_res,
    customer.fone,
    customer.celular,
    customer.login,
    customer.email,
    customer.endereco,
    customer.numero,
    customer.complemento,
    customer.bairro,
    customer.cidade,
    customer.estado,
    customer.cep,
    customer.bloqueado,
    customer.cli_ativado,
    customer.plano,
    idProvider,
    customer.cadastro
  );

  return dbConfig.executeQuery(sql);
};

const updateCustomer = customer => {
  const sql = util.format(
    `UPDATE cliente SET 
      nome ='%s', 
      cpf_cnpj ='%s', 
      nome_res ='%s', 
      fone = '%s', 
      celular ='%s', 
      login ='%s', 
      email = '%s', 
      endereco ='%s', 
      numero ='%s', 
      complemento ='%s', 
      bairro ='%s', 
      cidade ='%s', 
      estado ='%s', 
      cep ='%s', 
      bloqueado ='%s', 
      cli_ativado ='%s', 
      plano ='%s', 
      data_atualizacao =  NOW(), 
      cadastro = '%s' 
      WHERE ID = %d`,
    customer.nome,
    customer.cpf_cnpj,
    customer.nome_res,
    customer.fone,
    customer.celular,
    customer.login,
    customer.email,
    customer.endereco,
    customer.numero,
    customer.complemento,
    customer.bairro,
    customer.cidade,
    customer.estado,
    customer.cep,
    customer.bloqueado,
    customer.cli_ativado,
    customer.plano,
    customer.cadastro,
    customer.id
  );

  return dbConfig.executeQuery(sql);
};

module.exports = {
  listAllCustomers: listAllCustomers,
  listCustomersByProviderId: listCustomersByProviderId,
  getCustomersFromProviderId: getCustomersFromProviderId,
  getCustomerFromProvider: getCustomerFromProvider,
  getProviderData: getProviderData,
  getProviderDataByCod: getProviderDataByCod,
  getLocalCustomerFromProvider: getLocalCustomerFromProvider,
  getLocalCustomer: getLocalCustomer,
  saveCustomer: saveCustomer,
  updateCustomer: updateCustomer,
  updateCustomerOpenOS: updateCustomerOpenOS
};
