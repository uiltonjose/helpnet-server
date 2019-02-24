const customerDAO = require("../dao/customerDAO");

const dbConfig = require("../db_config"),
  util = require("util");

module.exports = {
  //
  // Registra uma nova Notificação
  //

  // TODO: Refactor this. Too complexity too understand. Make this more simple.
  saveNotification: function saveNotification(notificationObj, callback) {
    dbConfig.getConnection.beginTransaction(function(err) {
      console.log("Transaction beginner");
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
            "Rollback transaction: Problem to persist the notification"
          );
          dbConfig.getConnection.rollback(function() {
            callback(err, null);
          });
        } else {
          console.log("A Notificação foi registrada com sucesso");
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
              sqlInsert =
                sqlInsert +
                "(" +
                result.insertId +
                ", " +
                customerId +
                ", 'S', NOW(), NOW())";
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

  updateNotification: function updateNotification(
    notificationId,
    customerId,
    callback
  ) {
    let sql = util.format(
      "UPDATE notificacao_cliente set status = 'R', dataUltimaAlteracao = NOW() WHERE notificacaoId = %s AND clienteID = %s",
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
          "A Notificação " +
            notificationId +
            " do cliente " +
            customerId +
            " foi atualizada com sucesso"
        );
      }
    });
  },
  //
  // Listar Notificações do cliente
  //
  listNotificationsByCustomerId: function listNotificationsByCustomerId(
    customerId,
    callback
  ) {
    const sql = util.format(
      "select * from notificacao n inner join notificacao_cliente nc on n.id = nc.notificacaoId where nc.clienteId = %s",
      customerId
    );

    dbConfig.runQuery(sql, callback.bind(this));
  },
  //
  // Listar Notificações do Provedor
  //
  listNotificationsByProviderId: function listNotificationsByProviderId(
    providerId,
    callback
  ) {
    //TODO - Formatar a data aqui...
    var mask = "DATE_FORMAT(data_envio, %s) + '%d/%m/%Y %H:%i:%S'";
    const sql = util.format(
      "select titulo as Titulo, mensagem as Mensagem, " +
        " data_envio as 'Data_de_Envio' from " +
        "notificacao where provider_id = %s ORDER BY data_envio DESC ",

      providerId
    );

    dbConfig.runQuery(sql, callback.bind(this));
  }
};
