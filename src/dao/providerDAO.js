const dbConfig = require("../db_config"),
  util = require("util");

module.exports = {
  listAllProviders: function listAllProviders(callback) {
    const sql = util.format("SELECT * FROM provedor");
    dbConfig.runQuery(sql, callback.bind(this));
  },

  getProviderByProvedorIdAndConfirmationCode: function getProviderByProvedorIdAndConfirmationCode(
    providerCode,
    providerId,
    callback
  ) {
    const sql = util.format(
      "SELECT * FROM provedor WHERE CODIGO = %d and id = %d",
      providerCode,
      providerId
    );
    dbConfig.runQuery(sql, (err, result) => {
      if (err) {
        console.log("Something went wrong in your query.", err);
      }
      callback(err, result);
    });
  },

  updateProvider: function updateProvider(provider, callback) {
    const sql = util.format(
      `UPDATE provedor SET 
        NOME = "%s", 
        DESCRICAO = "%s", 
        LOGO = "%s", 
        SITUACAO = "%s",
        CODIGO = "%s", 
        CODIGO_CLIENTE = "%s",
        BD_NOME = "%s",
        BD_URL = "%s",
        BD_PORTA = "%s",
        BD_USUARIO = "%s",
        BD_SENHA = "%s",
        BD_TABLE = "%s",
        BD_COLUMN_IDENTIFY = "%s",
        BD_SELECT = "%s",
        EMAIL = "%s",
        TELEFONE_CONTATO = "%s",
        CELULAR_CONTATO = "%s",
        EMAIL_ENVIO_OS = "%s"
      WHERE ID = %s`,
      provider.name,
      provider.description,
      provider.logo,
      provider.state,
      provider.codeProvider,
      provider.codeClient,
      provider.dbName,
      provider.dbUrl,
      provider.dbPort,
      provider.dbUser,
      provider.dbPassword,
      provider.dbTable,
      provider.dbColumnIdentify,
      provider.dbSelect,
      provider.email,
      provider.phone,
      provider.cellphone,
      provider.emailToSendOS,
      provider.providerId
    );

    dbConfig.getConnection.query(sql, (err, result) => {
      if (err) {
        console.log("Something went wrong in your query.", err);
      }
      callback(err, result);
    });
  },

  addProvider: function addProvider(provider, callback) {
    const sql = util.format(
      `INSERT INTO provedor (
        NOME, 
        DESCRICAO, 
        SITUACAO, 
        BD_NOME,
        BD_URL,
        BD_PORTA,
        BD_USUARIO,
        BD_SENHA,
        BD_TABLE,
        BD_COLUMN_IDENTIFY,
        BD_SELECT,
        EMAIL,
        TELEFONE_CONTATO,
        CELULAR_CONTATO,
        EMAIL_ENVIO_OS,
        LOGO,
        CODIGO,
        CODIGO_CLIENTE
        )
       VALUES ('%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s', '%s')`,
      provider.name,
      provider.description,
      "Ativo",
      provider.dbName,
      provider.dbUrl,
      provider.dbPort,
      provider.dbUser,
      provider.dbPassword,
      provider.dbTable,
      provider.dbColumnIdentify,
      provider.dbSelect,
      provider.email,
      provider.phone,
      provider.cellphone,
      provider.emailToSendOS,
      provider.logo,
      provider.codeProvider,
      provider.codeClient
    );

    dbConfig.getConnection.query(sql, (err, result) => {
      if (err) {
        console.log("Something went wrong in your query.", err);
      }
      callback(err, result);
    });
  }
};
