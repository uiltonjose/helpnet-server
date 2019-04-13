const dbConfig = require("../db_config");
const util = require("util");
const Enum = require("../model/Enum");

const changeSituationOS = object => {
  return new Promise((resolve, reject) => {
    getOsByNumber(object.osNumber).then(
      osResult => {
        let sql = "";
        let os = osResult[0];
        sql = selectSqlFromEventType(object, sql, os);

        dbConfig.executeQuery(sql).then(
          () => {
            saveEvent(object, os, resolve, reject);
          },
          error => {
            reject(error);
          }
        );
      },
      error => {
        reject(error);
      }
    );
  });
};

/**
 * @description Get the OS by id
 */
const getOsById = osId => {
  const sql = util.format("SELECT * FROM os WHERE ID = %s", osId);
  return dbConfig.executeQuery(sql);
};

/**
 * @description Get the OS by Number
 */
const getOsByNumber = osNumber => {
  const sql = util.format("SELECT * FROM os WHERE NUMERO = %s", osNumber);
  return dbConfig.executeQuery(sql);
};

/**
 * @description Associate User
 */

const associateUserWithOs = os => {
  return new Promise((resolve, reject) => {
    dbConfig.getConnection.beginTransaction(err => {
      console.log("Transaction beginning");
      if (err) {
        console.error("It was not possible to proceed the transaction.", err);
        reject(err);
      }

      let sql = util.format(
        "UPDATE os SET USUARIO_ID = %s WHERE ID = %s",
        os.userId,
        os.osId
      );

      dbConfig.executeQuery(sql).then(
        () => {
          let event = os.event;
          event.osId = os.osId;
          console.log(`OS with ID=${event.osId} updated successfully.`);

          sql = util.format(
            "INSERT INTO evento (DATA_HORA, OS_ID, TIPO_EVENTO_ID, OBSERVACAO, USUARIO_ID) VALUES (NOW(), %s, '%s','%s', %s)",
            event.osId,
            event.eventTypeID,
            event.description,
            event.userId
          );

          saveNewEventAfterAssociateUser(sql, os, resolve, reject);
        },
        error => {
          console.error(
            "Rollback Transaction: Problem during OS update.",
            error
          );
          dbConfig.getConnection.rollback(function() {
            reject(error);
          });
        }
      );
    });
  });
};

const saveNewEventAfterAssociateUser = (sql, os, resolve, reject) => {
  dbConfig.executeQuery(sql).then(
    () => {
      dbConfig.getConnection.commit(function(error, result) {
        if (error) {
          dbConfig.getConnection.rollback(function() {
            console.error(
              "Problem during the commit. Rolling back transaction.",
              error
            );
            reject(error);
          });
        } else {
          console.log("Transaction completed.");
          resolve(os.osId);
        }
      });
    },
    error => {
      console.error(
        "Rollback Transaction: Problem during Event persistence.",
        error
      );
      dbConfig.getConnection.rollback(function() {
        reject(error);
      });
    }
  );
};

/**
 * @description Register new OS
 */
const registerOS = os => {
  return new Promise((resolve, reject) => {
    dbConfig.getConnection.beginTransaction(err => {
      console.log("Transaction beginning");

      if (err) {
        console.error("It was not possible to proceed the transaction.", err);
        reject(err);
      }

      const increment =
        "concat('" +
        os.number +
        "',(SELECT Auto_increment FROM information_schema.tables WHERE table_name='os' AND table_schema = DATABASE()))";

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

      dbConfig.executeQuery(sql).then(
        result => {
          let event = {};
          os.id = result.insertId;
          event.osId = result.insertId;
          event.eventTypeID = Enum.EventType.OPEN_OS;

          console.log(`OS registered with ID = ${event.osId}`);

          sql = util.format(
            "INSERT INTO evento (DATA_HORA, OS_ID, TIPO_EVENTO_ID) VALUES (NOW(), %s, %s)",
            event.osId,
            event.eventTypeID
          );

          dbConfig.executeQuery(sql).then(
            result => {
              console.log(
                `O Evento foi registrado com o ID = ${result.insertId}`
              );
              dbConfig.getConnection.commit(function(err, result) {
                if (err) {
                  console.error(
                    "Problem during the commit. Rolling back transaction.",
                    err
                  );
                  reject(error);
                }

                console.log("Transação completa.");

                getOsById(os.id).then(
                  osResult => {
                    resolve(osResult);
                  },
                  osError => {
                    reject(osError);
                  }
                );
              });
            },
            error => {
              console.error(
                "Rollback Transaction: Problem during Event persistence.",
                error
              );
              dbConfig.getConnection.rollback(function() {
                reject(error);
              });
            }
          );
        },
        error => {
          console.error(
            "Rollback Transaction: Problem during OS persistence.",
            error
          );
          dbConfig.getConnection.rollback(function() {
            reject(error);
          });
        }
      );
    });
  });
};

const canOpen = (providerId, customerId) => {
  const sql = util.format(
    "SELECT count(id) as total FROM os WHERE PROVEDOR_ID = %d AND CLIENTE_ID = %s AND SITUACAO_ID = %d",
    providerId,
    customerId,
    Enum.Situations.OPEN
  );
  return dbConfig.executeQuery(sql);
};

const getOSData = os => {
  return new Promise((resolve, reject) => {
    const sql = util.format(
      `SELECT cli.nome, cli.cpf_cnpj, cli.nome_res, cli.fone, cli.celular, cli.endereco, cli.numero,
       cli.bairro, cli.cidade, cli.estado, cli.cep, cli.cadastro, cli.email, cli.login, cli.plano, prob.titulo, os.numero as numeroOS,
       os.detalhes, prov.EMAIL_ENVIO_OS as emailEnvioOS
       FROM cliente as cli
       LEFT JOIN problema_os as prob on prob.id = %s
       LEFT JOIN provedor as prov on prov.id = %s
       LEFT JOIN os as os on os.id = %s
       where cli.id = %s`,
      os.problemId,
      os.providerId,
      os.id,
      os.customerId
    );

    dbConfig.executeQuery(sql).then(
      result => {
        const osResult = result[0];
        let osDescription = {};
        osDescription.numeroOS = osResult.numeroOS ? osResult.numeroOS : "";
        osDescription.detalhesOS =
          osResult.detalhes === null ? osResult.detalhes : "";
        osDescription.nomeCliente = osResult.nome === null ? osResult.nome : "";
        osDescription.problema =
          osResult.titulo === null ? osResult.titulo : "";
        osDescription.cpf_cnpj =
          osResult.cpf_cnpj === null ? osResult.cpf_cnpj : "";
        osDescription.nome_res =
          osResult.nome_res === null ? osResult.nome_res : "";
        osDescription.fone = osResult.fone === null ? osResult.fone : "";
        osDescription.celular =
          osResult.celular === null ? osResult.celular : "";
        osDescription.endereco =
          osResult.endereco === null ? osResult.endereco : "";
        osDescription.numero = osResult.numero === null ? osResult.numero : "";
        osDescription.bairro = osResult.bairro === null ? osResult.bairro : "";
        osDescription.cidade = osResult.cidade === null ? osResult.cidade : "";
        osDescription.estado = osResult.estado === null ? osResult.estado : "";
        osDescription.cep = osResult.cep === null ? osResult.cep : "";
        osDescription.login = osResult.login === null ? osResult.login : "";
        osDescription.plano = osResult.plano === null ? osResult.plano : "";
        osDescription.dataCadastroProvedor =
          osResult.cadastro === null ? osResult.cadastro : "";
        osDescription.emailEnvioOS =
          osResult.emailEnvioOS === null ? osResult.emailEnvioOS : "";
        resolve(osDescription);
      },
      error => {
        console.error(
          "Occurred an error trying to get OS' informations.",
          error
        );
        reject(error);
      }
    );
  });
};

/**
 * @description Listar todas as OS de um determinado provedor
 */
const listOsByProviderId = providerId => {
  const sql = util.format(
    `SELECT service.numero AS Número, cli.nome AS Nome, pro.TITULO AS Problema, service.detalhes as Detalhe, service.data_abertura AS Data_Abertura 
    FROM os service JOIN cliente cli ON cli.id = service.cliente_id JOIN problema_os pro ON pro.id = service.problema_id 
    AND PROVEDOR_ID = %d ORDER BY Data_Abertura DESC`,
    providerId
  );

  return dbConfig.executeQuery(sql);
};

/**
 * @description Listar as OS de um determinado provedor, filtrando pela situação
 */
const listOsByProviderIdAndSituationId = (providerId, situationId) => {
  const sql = util.format(
    "SELECT * FROM os WHERE PROVEDOR_ID = %d AND SITUACAO_ID = %d",
    providerId,
    situationId
  );

  return dbConfig.executeQuery(sql);
};

/**
 * @description List all OS by provider Id and Situation equal the Opened
 */
const listOsByProviderIdAndSituationOpened = providerId => {
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

  return dbConfig.executeQuery(sql);
};

/**
 * @description List all OS by ProviderId and Situation as Work in Progress.
 */
const listOsByProviderIdAndInProgress = providerId => {
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

  return dbConfig.executeQuery(sql);
};

/**
 * @description List all OS by ProviderId and Situation as Closed
 */
const listOsByProviderIdAndSituationClosed = providerId => {
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

  return dbConfig.executeQuery(sql);
};

/**
 * @description Listar todas as situações possiveis para uma OS
 */
const listAllSituationOS = () => {
  const sql = util.format("SELECT * FROM situacao_os");
  return dbConfig.executeQuery(sql);
};

const listOsByProviderIdAndCustomerId = (providerId, customerId) => {
  const sql = util.format(
    "SELECT * FROM os WHERE PROVEDOR_ID = %d AND CLIENTE_ID = %d",
    providerId,
    customerId
  );

  return dbConfig.executeQuery(sql);
};

const listEventFromOS = osId => {
  const sql = util.format(
    `SELECT ev.DATA_HORA AS "Data hora do evento", te.DESCRICAO AS "Descrição do evento", us.login AS "Usuário do evento", 
      ev.OBSERVACAO AS "Observação",
      usResp.login AS "Responsável pela OS"
      FROM evento ev 
      LEFT JOIN tipo_evento te ON ev.TIPO_EVENTO_ID = te.ID  
      LEFT JOIN usuario us ON ev.USUARIO_ID = us.id 
      LEFT JOIN os os ON os.ID = ev.OS_ID  
      LEFT JOIN usuario usResp ON ev.USUARIO_RESPONSAVEL_ID = usResp.id  
      WHERE ev.OS_ID = %d`,
    osId
  );
  return dbConfig.executeQuery(sql);
};

const saveEvent = (object, os, resolve, reject) => {
  let event = object.event;
  event.osId = os.ID;
  console.log(`A OS com o ID ${event.osId} foi atualizada.`);

  let responsableUser = object.userId;
  if (responsableUser == null) {
    responsableUser = os.USUARIO_ID;
  }

  const sql = util.format(
    "INSERT INTO evento (DATA_HORA, OS_ID, TIPO_EVENTO_ID, OBSERVACAO, USUARIO_ID, USUARIO_RESPONSAVEL_ID) VALUES (NOW(), %s, '%s','%s', %s, %s)",
    event.osId,
    event.eventTypeID,
    event.description,
    event.userId,
    responsableUser
  );

  dbConfig.executeQuery(sql).then(
    () => {
      getOsById(os.ID).then(
        osResult => {
          resolve(osResult);
        },
        osError => {
          reject(osError);
        }
      );
    },
    error => {
      console.error("Occurred an error trying to save an Event.", error);
      reject(error);
    }
  );
};

const selectSqlFromEventType = (object, sql, os) => {
  switch (object.situationId) {
    case 2:
      sql = util.format(
        "UPDATE os SET SITUACAO_ID = %s, USUARIO_ID = %s WHERE id = %s",
        object.situationId,
        object.userId,
        os.ID
      );
      break;
    case 3:
      sql = util.format(
        "UPDATE os SET SITUACAO_ID = %s, DATA_FECHAMENTO = NOW() WHERE id = %s",
        object.situationId,
        os.ID
      );
      break;
    default:
      sql = util.format(
        "UPDATE os SET SITUACAO_ID = %s WHERE id = %s",
        object.situationId,
        os.ID
      );
  }
  return sql;
};

module.exports = {
  associateUserWithOs: associateUserWithOs,
  registerOS: registerOS,
  canOpen: canOpen,
  getOSData: getOSData,
  listOsByProviderId: listOsByProviderId,
  listOsByProviderIdAndSituationId: listOsByProviderIdAndSituationId,
  listOsByProviderIdAndSituationOpened: listOsByProviderIdAndSituationOpened,
  listOsByProviderIdAndInProgress: listOsByProviderIdAndInProgress,
  listOsByProviderIdAndSituationClosed: listOsByProviderIdAndSituationClosed,
  listOsByProviderIdAndCustomerId: listOsByProviderIdAndCustomerId,
  listAllSituationOS: listAllSituationOS,
  listEventFromOS: listEventFromOS,
  getOsById: getOsById,
  getOsByNumber: getOsByNumber,
  changeSituationOS: changeSituationOS
};
