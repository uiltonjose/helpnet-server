const fs = require("fs"),
  JSZip = require("jszip"),
  dateUtil = require("../utils/DateUtil"),
  AWS = require("aws-sdk");

require("dotenv").config();

AWS.config.update({
  accessKeyId: process.env.AWS_ACCESS_KEY,
  secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY
});

const getFileFromAWS = fileName => {
  return new Promise(resolve => {
    var s3 = new AWS.S3();
    s3.getObject({ Bucket: process.env.AWS_S3_NAME, Key: fileName }, function(
      error,
      data
    ) {
      if (error != null) {
        console.log(error);
      } else {
        resolve(data.Body);
      }
    });
  });
};

const getCustomersFromFile = providerID => {
  return new Promise(resolve => {
    try {
      const fileName = providerID + "_" + dateUtil.getDateToFileName() + ".zip";
      getFileFromAWS(fileName).then(function(data) {
        JSZip.loadAsync(data).then(function(zip) {
          files = Object.keys(zip.files);
          console.log(files);
          zip
            .file(files[0])
            .async("string")
            .then(function(data) {
              resolve(builderListCustomerFromFile(data));
            });
        });
      });
    } catch (error) {
      console.log(error);
    }
  });
};

function builderListCustomerFromFile(data) {
  let customers = [];
  var linhas = data.split("\n");
  var insert = "";
  var i = 0;
  while (i < linhas.length && insert === "") {
    if (linhas[i].substring(0, 34) === "INSERT INTO `sis_cliente` VALUES (") {
      insert = linhas[i].substring(34);
    }
    i++;
  }
  i = 0;
  var rows = insert.split(",(");
  rows.forEach(row => {
    row = row.replace(/'/g, "");
    var itens = row.split(",");
    let customer = {};
    customer.id = itens[0];
    customer.nome = itens[1];
    customer.cpf_cnpj = itens[8];
    customer.nome_res = itens[79];
    customer.fone = itens[9];
    customer.celular = itens[26];
    customer.login = itens[14];
    customer.email = itens[2];
    customer.endereco = itens[3];
    customer.numero = itens[44];
    customer.complemento = itens[21];
    customer.bairro = itens[4];
    customer.cidade = itens[5];
    customer.estado = itens[7];
    customer.cep = itens[6];
    customer.bloqueado = itens[27];
    customer.cli_ativado = itens[34];
    customer.cadastro = itens[13];
    customer.plano = itens[32];
    customers.push(customer);
    i = i + 1;
  });
  return customers;
}

module.exports = {
  getCustomersFromFile: getCustomersFromFile
};
