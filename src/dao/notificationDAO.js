const customerDAO = require("../dao/customerDAO");
const status = require("../model/Enum");
const dbConfig = require("../db_config");
const util = require("util");

/**
 * @description Register a new Notification. From CMS/BO to Customer (Currently Mobile)
 */
const saveNotification = notificationObj => {
  return new Promise((resolve, reject) => {
    dbConfig.getConnection.beginTransaction(transactionError => {
      console.log("Transaction beginning");

      if (transactionError) {
        console.error(
          "It was not possible begin transaction.",
          transactionError
        );
        reject(transactionError);
      }

      let key = notificationObj.tags[0].key;
      let providerId = key.split("_")[0];
      let sql = util.format(
        `INSERT INTO notificacao (titulo, mensagem, provider_id, data_envio, usuario_id) 
          VALUES ('%s', '%s', %s, NOW(), %s)`,
        notificationObj.title,
        notificationObj.message,
        providerId,
        notificationObj.userId
      );

      dbConfig.executeQuery(sql).then(
        notificationResult => {
          let customerId;
          let count = 0;
          let sqlInsert =
            "INSERT INTO notificacao_cliente (notificacaoId, clienteId, status, dataInclusao, dataUltimaAlteracao) VALUES ";

          notificationObj.tags.forEach(notification => {
            if (notification.key !== undefined) {
              customerId = notification.key.split("_")[1];
              if (count > 0) {
                sqlInsert = sqlInsert + ", ";
              }

              sqlInsert = `${sqlInsert}(${
                notificationResult.insertId
              }, ${customerId}, '${
                status.NotificationStatus.SENT
              }', NOW(), NOW())`;
              count++;

              customerDAO
                .updateCustomerOpenOS(
                  notificationObj.blockOpenNewOS,
                  customerId
                )
                .then(
                  result => {
                    // For now, just ignoring this result...
                    console.log("Update of Customer Open OS", result);
                  },
                  error => {
                    console.error(
                      "Error during an Update of Customer Open OS",
                      error
                    );
                  }
                );
            }
          });

          const sqlNotificationCustomer = util.format(sqlInsert);
          dbConfig.executeQuery(sqlNotificationCustomer).then(
            result => {
              let idResult = result.insertId;
              dbConfig.getConnection.commit(err => {
                if (err) {
                  dbConfig.getConnection.rollback(function() {
                    console.error(
                      "Occur a problem during transaction commit.",
                      err
                    );
                    reject(err);
                  });
                }
                console.log("Transaction Completed.");
                resolve(idResult);
              });
            },
            error => {
              console.error("Rollback Transaction", error);
              dbConfig.getConnection.rollback(function() {
                reject(error);
              });
            }
          );
        },
        error => {
          console.error(
            "Rollback transaction: Problem to persist the notification.",
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

/**
 * @description Update in the server side the notification status as read.
 * @param {*} notificationId
 * @param {*} customerId
 */
const updateNotificationAsRead = (notificationId, customerId) => {
  let sql = util.format(
    `UPDATE notificacao_cliente SET status = '${
      status.NotificationStatus.READ
    }', dataUltimaAlteracao = NOW() WHERE notificacaoId = %s AND clienteID = %s`,
    notificationId,
    customerId
  );

  return dbConfig.executeQuery(sql);
};

/**
 * @description List all customer's notifications
 * @param {*} customerId
 */
const listNotificationsByCustomerId = customerId => {
  const sql = util.format(
    `SELECT * FROM notificacao notif 
      INNER JOIN notificacao_cliente notif_client 
        ON notif.id = notif_client.notificacaoId where notif_client.clienteId = %s`,
    customerId
  );

  return dbConfig.executeQuery(sql);
};

/**
 * @description List all Provider's notifications
 * @param  {} providerId
 */
const listNotificationsByProviderId = providerId => {
  const sql = util.format(
    `SELECT titulo as Titulo, mensagem as Mensagem, data_envio as 'Data_de_Envio' 
      FROM notificacao WHERE provider_id = %s ORDER BY data_envio DESC`,
    providerId
  );

  return dbConfig.executeQuery(sql);
};

/**
 * @description List all default message for notification
 */
const listDefaultMessageForNotification = () => {
  const sql = util.format("SELECT * FROM mensagem_padrao_notificacao");
  return dbConfig.executeQuery(sql);
};

module.exports = {
  saveNotification: saveNotification,
  updateNotificationAsRead: updateNotificationAsRead,
  listNotificationsByCustomerId: listNotificationsByCustomerId,
  listNotificationsByProviderId: listNotificationsByProviderId,
  listDefaultMessageForNotification: listDefaultMessageForNotification
};
