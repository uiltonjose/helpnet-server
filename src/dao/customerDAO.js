const dbConfig = require("../db_config"),
  util = require("util");

module.exports = {
  listClients: function listClients(callback) {
    const sql = util.format("SELECT * FROM cliente");
    dbConfig.runQuery(sql, callback.bind(this));
  },

  listByProviderId: function listByProviderId(customerId, callback) {
    const sql = util.format(
      "SELECT id as Ident, nome as Nome, cpf_cnpj as 'CPF/CNPJ', celular as Celular, login as Login, endereco as Endereço, complemento as Complemento, bairro as Bairro, plano as Plano " +
        "FROM cliente WHERE PROVIDER_ID = %s AND bloqueado = 'nao' AND cli_ativado = 's'",
      customerId
    );

    dbConfig.runQuery(sql, callback.bind(this));
  },

  //Consulta dos clientes na base do Provedor
  getCustomersFromProviderId: function getCustomersFromProviderId(
    interaction,
    totalInteraction,
    providers,
    callback
  ) {
    const provider = providers[interaction];
    const table = provider.BD_TABLE;
    const select = provider.BD_SELECT;
    const connectionProvider = dbConfig.getConnectionProvider(provider);

    const sqlProvider = util.format("%s FROM %s ", select, table);

    connectionProvider.query(sqlProvider, function(err, customersFromProvider) {
      if (err) {
        console.log(
          "Ocorreu um erro na consulta a base do provedor" + provider.ID,
          err
        );
      }

      if (
        typeof customersFromProvider !== "undefined" &&
        typeof customersFromProvider[0] !== "undefined"
      ) {
        callback(err, customersFromProvider, interaction);
      } else {
        interaction++;
        if (totalInteraction > interaction) {
          getCustomersFromProviderId(
            interaction,
            totalInteraction,
            providers,
            function(err, result) {
              callback(err, result, interaction);
            }
          );
        } else {
          callback(err, undefined);
        }
      }
    });
  },

  //Consulta de um cliente na base do Provedor
  getCustomerFromProvider: function getCustomerFromProvider(
    provider,
    cpf_cnpj,
    callback
  ) {
    const table = provider.BD_TABLE;
    const select = provider.BD_SELECT;
    const connectionProvider = dbConfig.getConnectionProvider(provider);
    const sqlProvider = util.format(
      "%s FROM %s WHERE cpf_cnpj = %s",
      select,
      table,
      cpf_cnpj
    );

    connectionProvider.query(sqlProvider, function(err, customersFromProvider) {
      if (err) {
        console.log(
          "Ocorreu um erro na consulta a base do provedor" + provider.ID,
          err
        );
      }

      if (
        typeof customersFromProvider !== "undefined" &&
        typeof customersFromProvider[0] !== "undefined"
      ) {
        callback(err, customersFromProvider);
      } else {
        callback(err, undefined);
      }
    });
  },

  getProviderData: function getProviderData(providerId, callback) {
    const sql = util.format(
      "SELECT * FROM provedor WHERE ID = %d AND SITUACAO = 'Ativo'",
      providerId
    );

    dbConfig.getConnection.query(sql, function(err, result) {
      callback(err, result);
    });
  },

  getProviderDataByCod: function getProviderDataByCod(providerCod, callback) {
    const sql = util.format(
      "SELECT * FROM provedor WHERE CODIGO_CLIENTE = %d AND SITUACAO = 'Ativo'",
      providerCod
    );

    dbConfig.getConnection.query(sql, function(err, result) {
      callback(err, result);
    });
  },

  //
  // Localiza o cliente na base do Helpnet
  //
  getLocalCustomerFromProvider: function getLocalCustomerFromProvider(
    providerID,
    callback
  ) {
    const sql = util.format(
      "SELECT * FROM cliente WHERE PROVIDER_ID = '%s'",
      providerID
    );

    dbConfig.getConnection.query(sql, function(err, result) {
      if (err) {
        console.log("Ocorreu um erro na consulta ao cliente", err);
      }
      callback(err, result);
    });
  },

  //
  // Localiza o cliente na base do Helpnet
  //
  getLocalCustomer: function getLocalCustomer(cpfCustomer, callback) {
    const sql = util.format(
      "SELECT * FROM cliente WHERE cpf_cnpj = '%s'",
      cpfCustomer
    );

    dbConfig.getConnection.query(sql, function(err, result) {
      if (err) {
        console.log("Ocorreu um erro na consulta ao cliente");
        console.log(err);
        callback(err, result);
      }
      callback(err, result);
    });
  },

  saveCustomer: function saveCustomer(customer, idProvider, callback) {
    const sql = util.format(
      "INSERT INTO cliente (" +
        "nome, cpf_cnpj, nome_res, fone, celular, login, email, endereco, numero, complemento, bairro, cidade, estado, cep, bloqueado, cli_ativado, plano, " +
        "PROVIDER_ID, cadastro, data_inclusao) VALUES ('%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s','%s','%s','%s','%s','%s','%s','%s','%s','%s', %s, '%s', NOW())",
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

    dbConfig.getConnection.query(sql, function(err, result) {
      if (err) {
        console.log("Problema na atualização dos dados do cliente");
        console.log(err);
      } else {
        callback(err, result);
      }
    });
  },

  updateCustomer: function updateCustomer(customer) {
    const sql = util.format(
      "UPDATE cliente SET " +
        "nome ='%s', " +
        "cpf_cnpj ='%s', " +
        "nome_res ='%s', " +
        "fone = '%s', " +
        "celular ='%s', " +
        "login ='%s', " +
        "email = '%s', " +
        "endereco ='%s', " +
        "numero ='%s', " +
        "complemento ='%s', " +
        "bairro ='%s', " +
        "cidade ='%s', " +
        "estado ='%s', " +
        "cep ='%s', " +
        "bloqueado ='%s', " +
        "cli_ativado ='%s', " +
        "plano ='%s', " +
        "data_atualizacao =  NOW(), " +
        "cadastro = '%s' " +
        "WHERE ID = %d",
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

    dbConfig.getConnection.query(sql, function(err, result) {
      if (err) {
        console.log(
          "Problema na atualização dos dados do cliente" + customer.cpf_cnpj
        );
        console.log(err);
      }
    });
  },

  updateCustomerOpenOS: function updateCustomerOpenOS(
    blockOpenNewOS,
    customerId,
    callback
  ) {
    const sql = util.format(
      "UPDATE cliente SET bloqueio_abrir_os ='%s' WHERE ID = %d",
      blockOpenNewOS,
      customerId
    );

    dbConfig.getConnection.query(sql, function(err, result) {
      callback(err, result);
    });
  }
};
