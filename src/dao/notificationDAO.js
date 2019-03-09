const customerDAO = require("../dao/customerDAO");
const status = require("../model/Enum");
const dbConfig = require("../db_config");
const util = require("util");

module.exports = {
  /**
   * @description Register a new Notification. From CMS/BO to Customer (Currently Mobile)
   */
  saveNotification: function saveNotification(notificationObj, callback) {
    // TODO: Refactor this method. Too complexity too understand. Make this more simple.
    dbConfig.getConnection.beginTransaction(function(err) {
      console.log("Transaction beginning");

      if (err) {
        console.log("It was not possible begin transaction.", err);
        callback(err, null);
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

      dbConfig.getConnection.query(sql, function(err, result) {
        if (err) {
          console.log(
            "Rollback transaction: Problem to persist the notification."
          );
          dbConfig.getConnection.rollback(function() {
            callback(err, null);
          });
        } else {
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

              sqlInsert = `${sqlInsert}(${result.insertId}, ${customerId}, '${
                status.NotificationStatus.SENT
              }', NOW(), NOW())`;
              count++;

              customerDAO.updateCustomerOpenOS(
                notificationObj.blockOpenNewOS,
                customerId,
                (error, result) => {
                  // For now, just ignoring this result...
                  console.log(error, result);
                }
              );
            }
          });

          const sqlNotificationCustomer = util.format(sqlInsert);

          dbConfig.getConnection.query(sqlNotificationCustomer, function(
            err,
            result
          ) {
            let idResult = result.insertId;
            if (err) {
              console.log("Rollback Transaction", err);
              dbConfig.getConnection.rollback(function() {
                callback(err, null);
              });
            }
            dbConfig.getConnection.commit(function(err) {
              if (err) {
                dbConfig.getConnection.rollback(function() {
                  console.log(
                    "Occur a problem during transaction commit.",
                    err
                  );
                  callback(err, null);
                });
              }
              console.log("Transaction Completed.");
              callback(null, idResult);
            });
          });
        }
      });
    });
  },

  /**
   * @description Update in the server side the notification status as read.
   * @param {*} notificationId
   * @param {*} customerId
   * @param {*} callback
   */
  updateNotificationAsRead: function updateNotificationAsRead(
    notificationId,
    customerId,
    callback
  ) {
    let sql = util.format(
      `UPDATE notificacao_cliente SET status = '${
        status.NotificationStatus.READ
      }', dataUltimaAlteracao = NOW() WHERE notificacaoId = %s AND clienteID = %s`,
      notificationId,
      customerId
    );

    dbConfig.getConnection.query(sql, function(err, result) {
      if (err) {
        console.log(err);
        callback(err, result);
      } else {
        callback(
          err,
          `A Notificação ${notificationId} do cliente ${customerId} foi atualizada com sucesso.`
        );
      }
    });
  },

  /**
   * @description List all customer's notifications
   * @param {*} customerId
   * @param {*} callback
   */
  listNotificationsByCustomerId: function listNotificationsByCustomerId(
    customerId,
    callback
  ) {
    const sql = util.format(
      `SELECT * FROM notificacao notif 
        INNER JOIN notificacao_cliente notif_client 
          ON notif.id = notif_client.notificacaoId where notif_client.clienteId = %s`,
      customerId
    );

    dbConfig.runQuery(sql, callback.bind(this));
  },

  /**
   * @description List all Provider's notifications
   * @param  {} providerId
   * @param  {} callback
   */
  listNotificationsByProviderId: function listNotificationsByProviderId(
    providerId,
    callback
  ) {
    const sql = util.format(
      `SELECT titulo as Titulo, mensagem as Mensagem, data_envio as 'Data_de_Envio' 
        FROM notificacao WHERE provider_id = %s ORDER BY data_envio DESC`,
      providerId
    );

    dbConfig.runQuery(sql, callback.bind(this));
  },

  /**
   * @description List all default message for notification
   * @param {*} callback
   */
  listDefaultMessageForNotification: function listDefaultMessageForNotification(
    callback
  ) {
    const sql = util.format("SELECT * FROM sugestao_notificacao");

    dbConfig.runQuery(sql, callback.bind(this));
  }
};
