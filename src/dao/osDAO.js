const dbConfig = require("../db_config");
const util = require("util");
const Enum = require("../model/Enum");

module.exports = {
  changeSituationOS: function changeSituationOS(object, callback) {
    dbConfig.getConnection.beginTransaction(function(err) {
      console.log("Transaction beginning");

      if (err) {
        console.log("Error: It was not possible to start transaction.", err);
        callback(err);
      }
      let sql = util.format(
        "UPDATE os SET SITUACAO_ID = %s WHERE id = %s",
        object.situationId,
        object.osId
      );
      dbConfig.getConnection.query(sql, function(err, result) {
        if (err) {
          console.log("Rollback Transaction: Problem during OS update.", err);
          dbConfig.getConnection.rollback(function() {
            callback(err);
          });
        } else {
          let event = object.event;
          event.osId = object.osId;
          console.log(`A OS com o ID ${event.osId} foi atualizada`);
          sql = util.format(
            "INSERT INTO evento (DATA_HORA, OS_ID, TIPO_EVENTO_ID, OBSERVACAO, USUARIO_ID) VALUES (NOW(), %s, '%s','%s', %s)",
            event.osId,
            event.eventTypeID,
            event.description,
            event.userId
          );
          dbConfig.getConnection.query(sql, function(err, result) {
            if (err) {
              console.log(
                "Rollback Transaction: Problem during Event persistence.",
                err
              );
              dbConfig.getConnection.rollback(function() {
                callback(err);
              });
            } else {
              console.log(
                "O Evento foi registrado com o ID = " +
                  JSON.stringify(result.insertId)
              );
              dbConfig.getConnection.commit(function(err, result) {
                if (err) {
                  dbConfig.getConnection.rollback(function() {
                    console.log("Ocorreu um erro no commit da transação", err);
                    callback(err);
                  });
                } else {
                  console.log("Transação completa.");
                  callback(err, object.osId);
                }
              });
            }
          });
        }
      });
    });
  },

  /**
   * @description Associate User
   */
  associateUserWithOs: function associateUserWithOs(os, callback) {
    dbConfig.getConnection.beginTransaction(function(err) {
      console.log("Transaction beginning");
      if (err) {
        console.log("Erro. Não foi possível iniciar transação", err);
        callback(err);
      }
      let sql = util.format(
        "UPDATE os SET USUARIO_ID = %s WHERE ID = %s",
        os.userId,
        os.osId
      );
      dbConfig.getConnection.query(sql, function(err, result) {
        if (err) {
          console.log("Rollback Transaction: Problem during OS update.", err);
          dbConfig.getConnection.rollback(function() {
            callback(err);
          });
        } else {
          let event = os.event;
          event.osId = os.osId;
          console.log("A OS com o ID = " + event.osId + " foi atualizada");
          sql = util.format(
            "INSERT INTO evento (DATA_HORA, OS_ID, TIPO_EVENTO_ID, OBSERVACAO, USUARIO_ID) VALUES (NOW(), %s, '%s','%s', %s)",
            event.osId,
            event.eventTypeID,
            event.description,
            event.userId
          );
          dbConfig.getConnection.query(sql, function(err, result) {
            if (err) {
              console.log(
                "Rollback Transaction: Problem during Event persistence.",
                err
              );
              dbConfig.getConnection.rollback(function() {
                callback(err);
              });
            } else {
              dbConfig.getConnection.commit(function(err, result) {
                if (err) {
                  dbConfig.getConnection.rollback(function() {
                    console.log("Ocorreu um erro no commit da transação", err);
                    callback(err);
                  });
                } else {
                  console.log("Transaction completed.");
                  callback(err, os.osId);
                }
              });
            }
          });
        }
      });
    });
  },

  /**
   * @description Register new OS
   */
  registerOS: function registerOS(os, callback) {
    dbConfig.getConnection.beginTransaction(function(err) {
      console.log("iniciou transação");
      if (err) {
        console.log("Erro. Não foi possível iniciar transação", err);
        callback(err);
      }
      let increment =
        "concat('" +
        os.number +
        "',(SELECT Auto_increment FROM information_schema.tables WHERE table_name='os'))";
      let sql = util.format(
        `INSERT INTO os (NUMERO, DATA_ABERTURA, CLIENTE_ID, PROBLEMA_ID, DETALHES, SITUACAO_ID, PROVEDOR_ID) 
          VALUES (${increment}, NOW(), %s, %s, '%s', ${
          Enum.Situations.OPEN
        }, %s)`,
        os.customerId,
        os.problemId,
        os.details,
        os.providerId
      );
      dbConfig.getConnection.query(sql, function(err, result) {
        if (err) {
          console.log(
            "Rollback Transaction: Problem during OS persistence.",
            err
          );
          dbConfig.getConnection.rollback(function() {
            callback(err);
          });
        } else {
          let event = {};
          os.id = result.insertId;
          event.osId = result.insertId;
          event.eventTypeID = 1;
          console.log("A OS foi registrada com o ID = " + event.osId);
          sql = util.format(
            "INSERT INTO evento (DATA_HORA, OS_ID, TIPO_EVENTO_ID) VALUES (NOW(), %s, %s)",
            event.osId,
            event.eventTypeID
          );
          dbConfig.getConnection.query(sql, function(err, result) {
            if (err) {
              console.log(
                "Rollback Transaction: Problem during Event persistence.",
                err
              );
              dbConfig.getConnection.rollback(function() {
                callback(err);
              });
            }

            console.log(
              "O Evento foi registrado com o ID = " + result.insertId
            );
            dbConfig.getConnection.commit(function(err, result) {
              if (err) {
                dbConfig.getConnection.rollback(function() {
                  console.log("Ocorreu um erro no commit da transação", err);
                  callback(err);
                });
              }
              console.log("Transação completa.");
              let sql = util.format(
                "SELECT NUMERO FROM os WHERE ID = %d",
                os.id
              );
              dbConfig.getConnection.query(sql, function(err, result) {
                if (err) {
                  console.log("Falha ao tentar recuperar o ID da OS", err);
                }
                callback(err, result[0].NUMERO);
              });
            });
          });
        }
      });
    });
  },

  canOpen: function canOpen(providerId, customerId, callback) {
    const sql = util.format(
      "SELECT count(id) as total FROM os WHERE PROVEDOR_ID = %d AND CLIENTE_ID = %s AND SITUACAO_ID = %d",
      providerId,
      customerId,
      Enum.Situations.OPEN
    );
    dbConfig.runQuery(sql, callback);
  },

  getOSData: function getOSData(os, callback) {
    const sql = util.format(
      `SELECT cli.nome, cli.cpf_cnpj, cli.nome_res, cli.fone, cli.celular, cli.endereco, cli.numero,
       cli.bairro, cli.cidade, cli.estado, cli.cep, cli.cadastro, cli.email, cli.login, cli.plano, prob.titulo, os.numero as numeroOS,
       os.detalhes, prov.EMAIL_ENVIO_OS as emailEnvioOS
       FROM cliente as cli
       join problema_os as prob on prob.id = %s
       join provedor as prov on prov.id = %s
       join os as os on os.id = %s
       where cli.id = %s`,
      os.problemId,
      os.providerId,
      os.id,
      os.customerId
    );

    dbConfig.getConnection.query(sql, function(err, result) {
      if (err) {
        console.log(
          "Ocorreu um erro ao tentar obter as informações da OS",
          err
        );
        callback(err, result);
      } else {
        const osResult = result[0];
        let osDescription = {};
        osDescription.numeroOS = osResult.numeroOS;
        osDescription.detalhesOS = osResult.detalhes;
        osDescription.nomeCliente = osResult.nome;
        osDescription.problema = osResult.titulo;
        osDescription.cpf_cnpj = osResult.cpf_cnpj;
        osDescription.nome_res = osResult.nome_res;
        osDescription.fone = osResult.fone;
        osDescription.celular = osResult.celular;
        osDescription.endereco = osResult.endereco;
        osDescription.numero = osResult.numero;
        osDescription.bairro = osResult.bairro;
        osDescription.cidade = osResult.cidade;
        osDescription.estado = osResult.estado;
        osDescription.cep = osResult.cep;
        osDescription.login = osResult.login;
        osDescription.plano = osResult.plano;
        osDescription.dataCadastroProvedor = osResult.cadastro;
        osDescription.emailEnvioOS = osResult.emailEnvioOS;
        callback(err, osDescription);
      }
    });
  },

  /**
   * @description Listar todas as OS de um determinado provedor
   */
  listOsByProviderId: function listOsByProviderId(providerId, callback) {
    const sql = util.format(
      `SELECT service.numero AS Número, cli.nome AS Nome, pro.TITULO AS Problema, service.detalhes as Detalhe, service.data_abertura AS Data_Abertura 
      FROM os service JOIN cliente cli ON cli.id = service.cliente_id JOIN problema_os pro ON pro.id = service.problema_id 
      AND PROVEDOR_ID = %d ORDER BY Data_Abertura DESC`,
      providerId
    );

    dbConfig.runQuery(sql, callback.bind(this));
  },

  /**
   * @description Listar as OS de um determinado provedor, filtrando pela situação
   */
  listOsByProviderIdAndSituationId: function listOsByProviderIdAndSituationId(
    providerId,
    situationId,
    callback
  ) {
    const sql = util.format(
      "SELECT * FROM os WHERE PROVEDOR_ID = %d AND SITUACAO_ID = %d",
      providerId,
      situationId
    );

    dbConfig.runQuery(sql, callback.bind(this));
  },

  /**
   * @description List all OS by provider Id and Situation equal the Opened
   */
  listOsByProviderIdAndSituationOpened: function listOsByProviderIdAndSituationOpened(
    providerId,
    callback
  ) {
    const sql = util.format(
      `SELECT
       service.numero AS Número,
       cli.nome AS Nome,
       pro.TITULO AS Problema,
       service.DETALHES as Detalhe,
       service.DATA_ABERTURA AS 'Data Abertura'
       FROM os service
       LEFT JOIN cliente cli ON cli.id = service.cliente_id
       LEFT JOIN problema_os pro ON pro.id = service.problema_id
       WHERE service.PROVEDOR_ID = %d
       AND service.SITUACAO_ID = ${Enum.Situations.OPEN}
       ORDER BY service.DATA_ABERTURA DESC`,
      providerId
    );

    dbConfig.runQuery(sql, callback.bind(this));
  },

  /**
   * @description List all OS by ProviderId and Situation as Work in Progress.
   */
  listOsByProviderIdAndInProgress: function listOsByProviderIdAndInProgress(
    providerId,
    callback
  ) {
    const sql = util.format(
      `SELECT
       service.numero AS Número,
       cli.nome AS Nome,
       pro.TITULO AS Problema,
       service.DETALHES as Detalhe,
       service.DATA_ABERTURA AS 'Data Abertura',
       usu.login AS Responsável
       FROM os service
       LEFT JOIN cliente cli ON cli.id = service.cliente_id
       LEFT JOIN problema_os pro ON pro.id = service.problema_id
       LEFT JOIN usuario usu ON usu.id = service.USUARIO_ID
       WHERE service.PROVEDOR_ID = %d
       AND service.SITUACAO_ID = ${Enum.Situations.WORK_IN_PROGRESS}
       ORDER BY service.DATA_ABERTURA DESC`,
      providerId
    );

    dbConfig.runQuery(sql, callback.bind(this));
  },

  /**
   * @description List all OS by ProviderId and Situation as Closed
   */
  listOsByProviderIdAndSituationClosed: function listOsByProviderIdAndSituationClosed(
    providerId,
    callback
  ) {
    const sql = util.format(
      `SELECT
       service.numero AS Número,
       cli.nome AS Nome,
       pro.TITULO AS Problema,
       service.DETALHES as Detalhe,
       service.DATA_ABERTURA AS 'Data Abertura',
       service.DATA_FECHAMENTO AS 'Data fechamento',
       usu.login AS Responsável
       FROM os service
       LEFT JOIN cliente cli ON cli.id = service.cliente_id
       LEFT JOIN problema_os pro ON pro.id = service.problema_id
       LEFT JOIN usuario usu ON usu.id = service.USUARIO_ID
       WHERE service.PROVEDOR_ID = %d
       AND service.SITUACAO_ID = ${Enum.Situations.CLOSED}
       ORDER BY Data_Abertura DESC`,
      providerId
    );

    dbConfig.runQuery(sql, callback.bind(this));
  },

  listOsByProviderIdAndCustomerId: function listOsByProviderIdAndCustomerId(
    providerId,
    customerId,
    callback
  ) {
    const sql = util.format(
      "SELECT * FROM os WHERE PROVEDOR_ID = %d AND CLIENTE_ID = %d",
      providerId,
      customerId
    );

    dbConfig.runQuery(sql, callback.bind(this));
  },

  /**
   * @description Listar todas as situações possiveis para uma OS
   */
  listAllSituationOS: function listAllSituationOS(callback) {
    const sql = util.format("SELECT * FROM situacao_os");

    dbConfig.runQuery(sql, callback.bind(this));
  },

  /**
   * @description Get the OS by id
   */
  getOsById: function getOsById(osId, callback) {
    const sql = util.format("SELECT * FROM os WHERE id = %s", osId);

    dbConfig.runQuery(sql, callback.bind(this));
  }
};
