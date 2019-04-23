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
    const s3 = new AWS.S3();
    s3.getObject(
      { Bucket: process.env.AWS_S3_NAME, Key: fileName },
      (error, data) => {
        if (error != null) {
          resolve(error);
        } else {
          resolve(data.Body);
        }
      }
    );
  });
};

const getCustomersFromFile = providerID => {
  return new Promise(resolve => {
    try {
      const fileName = `${providerID}_${dateUtil.getDateToFileName()}.zip`;
      getFileFromAWS(fileName).then(data => {
        JSZip.loadAsync(data).then(zip => {
          files = Object.keys(zip.files);
          zip
            .file(files[0])
            .async("string")
            .then(data => {
              resolve(builderListCustomerFromFile(data));
            });
        });
      });
    } catch (error) {
      resolve(error);
    }
  });
};

const builderListCustomerFromFile = data => {
  let customers = [];
  const linhas = data.split("\n");
  let insert = "";
  let i = 0;
  while (i < linhas.length && insert === "") {
    const lineIdentifier = "INSERT INTO `sis_cliente` VALUES (";
    if (linhas[i].substring(0, 34) === lineIdentifier) {
      insert = linhas[i].substring(34);
    }
    i++;
  }
  i = 0;
  const rows = insert.split(",(");
  rows.forEach(row => {
    row = row.replace(/'/g, "");
    const itens = row.split(",");
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
};

module.exports = {
  getCustomersFromFile: getCustomersFromFile
};
