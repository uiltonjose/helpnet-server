const dbConfig = require("../db_config"),
  util = require("util");

module.exports = {
  changeSituationOS: function changeSituationOS(object, callback) {
    dbConfig.getConnection.beginTransaction(function(err) {
      console.log("iniciou transação");
      if (err) {
        console.log("Erro. Não foi possível iniciar transação..");
        callback(err);
      }
      let sql = util.format(
        "UPDATE os SET SITUACAO_ID = %s WHERE id = %s",
        object.situationId,
        object.osId
      );
      dbConfig.query(sql, function(err, result) {
        if (err) {
          console.log("Fazendo roolback - Problema na atualização da OS");
          dbConfig.getConnection.rollback(function() {
            callback(err);
          });
        } else {
          let event = object.event;
          event.osId = object.osId;
          console.log("A OS com o ID = " + event.osId + " foi atualizada");
          sql = util.format(
            "INSERT INTO evento (DATA_HORA, OS_ID, TIPO_EVENTO_ID, OBSERVACAO, TECNICO_ID) VALUES (NOW(), %s, '%s','%s', %s)",
            event.osId,
            event.tipoEventID,
            event.description,
            event.technicalId
          );
          dbConfig.getConnection.query(sql, function(err, result) {
            if (err) {
              console.log(
                "Fazendo roolback - Problema na persistência do Evento"
              );
              dbConfig.getConnection.rollback(function() {
                callback(err);
              });
            }
            console.log("O Evento foi registrado com o ID = " + object.osId);
            dbConfig.getConnection.commit(function(err, result) {
              if (err) {
                dbConfig.getConnection.rollback(function() {
                  console.log("Ocorreu um erro no commit da transação ");
                  callback(err);
                });
              }
              console.log("Transação completa.");
              callback(err, event.osId);
            });
          });
        }
      });
    });
  },

  //
  // Associate Technical
  //
  associateTechnical: function associateTechnical(os, callback) {
    dbConfig.getConnection.beginTransaction(function(err) {
      console.log("iniciou transação");
      if (err) {
        console.log("Erro. Não foi possível iniciar transação..");
        callback(err);
      }
      let sql = util.format(
        "UPDATE os SET TECNICO_ID = %s WHERE ID = %s",
        os.technicalId,
        os.osId
      );
      dbConfig.getConnection.query(sql, function(err, result) {
        if (err) {
          console.log("Fazendo roolback - Problema na atualização da OS");
          dbConfig.getConnection.rollback(function() {
            callback(err);
          });
        } else {
          let event = os.event;
          event.osId = os.osId;
          console.log("A OS com o ID = " + event.osId + " foi atualizada");
          sql = util.format(
            "INSERT INTO evento (DATA_HORA, OS_ID, TIPO_EVENTO_ID, OBSERVACAO, TECNICO_ID) VALUES (NOW(), %s, '%s','%s', %s)",
            event.osId,
            event.tipoEventID,
            event.description,
            event.technicalId
          );
          dbConfig.getConnection.query(sql, function(err, result) {
            if (err) {
              console.log(
                "Fazendo roolback - Problema na persistência do Evento"
              );
              dbConfig.getConnection.rollback(function() {
                callback(err);
              });
            }
            console.log("O Evento foi registrado com o ID = "); //+  result.insertId );
            dbConfig.getConnection.commit(function(err, result) {
              if (err) {
                dbConfig.getConnection.rollback(function() {
                  console.log("Ocorreu um erro no commit da transação ");
                  callback(err);
                });
              }
              console.log("Transação completa.");
              callback(err, result);
            });
          });
        }
      });
    });
  },

  //
  // Registra uma nova OS
  //
  registerOS: function registerOS(os, callback) {
    dbConfig.getConnection.beginTransaction(function(err) {
      console.log("iniciou transação");
      if (err) {
        console.log("Erro. Não foi possível iniciar transação..");
        callback(err);
      }
      let increment =
        "concat('" +
        os.number +
        "',(SELECT Auto_increment FROM information_schema.tables WHERE table_name='os'))";
      let sql = util.format(
        "INSERT INTO os (NUMERO, DATA_ABERTURA, CLIENTE_ID, PROBLEMA_ID, DETALHES, SITUACAO_ID, PROVEDOR_ID) VALUES (" +
          increment +
          ", NOW(), %s, %s, '%s', 1, %s)",
        os.clienteId,
        os.problemId,
        os.details,
        os.providerId
      );
      dbConfig.getConnection.query(sql, function(err, result) {
        if (err) {
          console.log("Fazendo roolback - Problema na persistência da OS");
          dbConfig.getConnection.rollback(function() {
            callback(err);
          });
        } else {
          let event = {};
          os.id = result.insertId;
          event.osId = result.insertId;
          event.tipoEventID = 1;
          console.log("A OS foi registrada com o ID = " + event.osId);
          sql = util.format(
            "INSERT INTO evento (DATA_HORA, OS_ID, TIPO_EVENTO_ID) VALUES (NOW(), %s, %s)",
            event.osId,
            event.tipoEventID
          );
          dbConfig.getConnection.query(sql, function(err, result) {
            if (err) {
              console.log(
                "Fazendo roolback - Problema na persistência do Evento"
              );
              dbConfig.getConnection.rollback(function() {
                callback(err);
              });
            }

            console.log("O Evento foi registrado com o ID = " + os.id);
            dbConfig.getConnection.commit(function(err, result) {
              if (err) {
                dbConfig.getConnection.rollback(function() {
                  console.log("Ocorreu um erro no commit da transação ");
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
                  console.log("Falha ao tentar recuperar o ID da OS");
                }
                callback(err, JSON.stringify(result[0].NUMERO));
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
      "1"
    );

    try {
      dbConfig.runQuery(sql, callback.bind(this));
    } catch (error) {
      throw ("Error during listOSBySituation", error);
    }
  },

  getOSData: function getOSData(os, callback) {
    const sql = util.format(
      "SELECT cli.nome, cli.cpf_cnpj, cli.nome_res, cli.fone, cli.celular, cli.endereco, cli.numero, " +
        "cli.bairro, cli.cidade, cli.estado, cli.cep, cli.cadastro, cli.email, cli.login, cli.plano, prob.titulo, os.numero as numeroOS, " +
        "os.detalhes, prov.EMAIL_ENVIO_OS as emailEnvioOS " +
        "FROM cliente as cli " +
        "join problema_os as prob on prob.id = %s " +
        "join provedor as prov on prov.id = %s " +
        "join os as os on os.id = %s " +
        "where cli.id = %s",
      os.problemId,
      os.providerId,
      os.id,
      os.clienteId
    );

    dbConfig.getConnection.query(sql, function(err, result) {
      if (err) {
        console.log("Ocorreu um erro ao tentar obter as informações da OS");
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

  //
  // Listar todas as OS de um determinado provedor
  //
  listOSByProvider: function listOSByProvider(providerId, callback) {
    const sql = util.format(
      `SELECT service.numero AS Número, cli.nome AS Nome, pro.TITULO AS Problema, service.detalhes as Detalhe, service.data_abertura AS Data_Abertura 
      FROM os service JOIN 
      cliente cli ON cli.id = service.cliente_id JOIN 
      problema_os pro ON pro.id = service.problema_id AND PROVEDOR_ID = %d 
      ORDER BY Data_Abertura DESC`,
      providerId
    );

    dbConfig.runQuery(sql, callback.bind(this));
  },

  //
  // Listar as OS de um determinado provedor, filtrnado pela situação
  //
  listOSBySituation: function listOSBySituation(
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

  listOSByCustomer: function listOSByCustomer(
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

  //
  // Listar todas as situações possiveis para uma OS
  //
  listSituations: function listSituations(callback) {
    const sql = util.format("SELECT * FROM situacao_os");

    dbConfig.runQuery(sql, callback.bind(this));
  }
};
