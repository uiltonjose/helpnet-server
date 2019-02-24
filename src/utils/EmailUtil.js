const nodemailer = require("nodemailer");
require("dotenv").config();

module.exports = {
  sendMail: function sendMail(subject, content, emailsTo, callback) {
    const transporter = nodemailer.createTransport({
      service: "Gmail",
      auth: {
        user: process.env.EMAIL_USER,
        pass: process.env.EMAIL_PASSWORD
      },
      tls: { rejectUnauthorized: false }
    });

    const mailOptions = {
      from: process.env.EMAIL_FROM,
      to: emailsTo,
      bcc: process.env.EMAILS_TO,
      subject: subject,
      html: "<html>" + content + "</html>"
    };

    transporter.sendMail(mailOptions, function(error, info) {
      if (error) {
        console.log(error);
      } else {
        console.log("Email enviado: " + info.response);
      }
    });
  },

  builderContentMailNewOS: function builderContentMailNewOS(osDescription) {
    if (
      osDescription.nomeCliente == "null" ||
      osDescription.nomeCliente == null
    )
      osDescription.nomeCliente = "";
    if (osDescription.cpf_cnpj == "null" || osDescription.cpf_cnpj == null)
      osDescription.cpf_cnpj = "";
    if (osDescription.nome_res == "null" || osDescription.nome_res == null)
      osDescription.nome_res = "";
    if (osDescription.fone == "null" || osDescription.fone == null)
      osDescription.fone = "";
    if (osDescription.celular == "null" || osDescription.celular == null)
      osDescription.celular = "";
    if (osDescription.login == "null" || osDescription.login == null)
      osDescription.login = "";
    if (osDescription.email == "null" || osDescription.email == null)
      osDescription.email = "";
    if (osDescription.endereco == "null" || osDescription.endereco == null)
      osDescription.endereco = "";
    if (osDescription.numero == "null" || osDescription.numero == null)
      osDescription.numero = "";
    if (osDescription.bairro == "null" || osDescription.bairro == null)
      osDescription.bairro = "";
    if (osDescription.cidade == "null" || osDescription.cidade == null)
      osDescription.cidade = "";
    if (osDescription.estado == "null" || osDescription.estado == null)
      osDescription.estado = "";
    if (osDescription.cep == "null" || osDescription.cep == null)
      osDescription.cep = "";
    if (osDescription.login == "null" || osDescription.login == null)
      osDescription.login = "";
    if (osDescription.plano == "null" || osDescription.plano == null)
      osDescription.plano = "";
    if (osDescription.bloqueado == "null" || osDescription.bloqueado == null)
      osDescription.bloqueado = "";
    if (
      osDescription.cli_ativado == "null" ||
      osDescription.cli_ativado == null
    )
      osDescription.cli_ativado = "";
    if (
      osDescription.dataCadastroProvedor == "null" ||
      osDescription.dataCadastroProvedor == null
    )
      osDescription.dataCadastroProvedor = "";
    result =
      "<h1>Informações da OS aberta:</h1>" +
      "<table>" +
      // Numero da OS
      "<tr>" +
      "<td>" +
      "Número: " +
      "</td>" +
      "<td>" +
      osDescription.numeroOS +
      "</td>" +
      "</tr>" +
      // Nome do Cliente
      "<tr>" +
      "<td>" +
      "Nome do Cliente: " +
      "</td>" +
      "<td>" +
      osDescription.nomeCliente +
      "</td>" +
      "</tr>" +
      // CPF do Cliente
      "<tr>" +
      "<td>" +
      "CPF do Cliente: " +
      "</td>" +
      "<td>" +
      osDescription.cpf_cnpj +
      "</td>" +
      "</tr>" +
      // nome_res
      "<tr>" +
      "<td>" +
      "Referência: " +
      "</td>" +
      "<td>" +
      osDescription.nome_res +
      "</td>" +
      "</tr>" +
      // Data Cadastro no Provedor
      "<tr>" +
      "<td>" +
      "Data Cadastro: " +
      "</td>" +
      "<td>" +
      osDescription.dataCadastroProvedor +
      "</td>" +
      "</tr>" +
      // Login
      "<tr>" +
      "<td>" +
      "Login: " +
      "</td>" +
      "<td>" +
      osDescription.login +
      "</td>" +
      "</tr>" +
      // Plano
      "<tr>" +
      "<td>" +
      "Plano: " +
      "</td>" +
      "<td>" +
      osDescription.plano +
      "</td>" +
      "</tr>" +
      // Fone
      "<tr>" +
      "<td>" +
      "Telelfone: " +
      "</td>" +
      "<td>" +
      osDescription.fone +
      "</td>" +
      // Celular
      "<td>" +
      "Celular: " +
      "</td>" +
      "<td>" +
      osDescription.celular +
      "</td>" +
      "</tr>" +
      // Endereço
      "<tr>" +
      "<td>" +
      "Endereço: " +
      "</td>" +
      "<td>" +
      osDescription.endereco +
      "</td>" +
      // Numero
      "<td>" +
      "Número: " +
      "</td>" +
      "<td>" +
      osDescription.numero +
      "</td>" +
      "</tr>" +
      // Bairro
      "<tr>" +
      "<td>" +
      "Bairro: " +
      "</td>" +
      "<td>" +
      osDescription.bairro +
      "</td>" +
      // Cidade
      "<td>" +
      "Cidade: " +
      "</td>" +
      "<td>" +
      osDescription.cidade +
      "</td>" +
      // Estado
      "<td>" +
      "Estado: " +
      "</td>" +
      "<td>" +
      osDescription.estado +
      "</td>" +
      "</tr>" +
      // CEP
      "<tr>" +
      "<td>" +
      "CEP: " +
      "</td>" +
      "<td>" +
      osDescription.cep +
      "</td>" +
      "</tr>" +
      // Problema reportado
      "<tr>" +
      "<td>" +
      "Problema: " +
      "</td>" +
      "<td>" +
      osDescription.problema +
      "</td>" +
      "</tr>" +
      // Detalhes sobre o problema
      "<tr>" +
      "<td>" +
      "Detalhe da OS: " +
      "</td>" +
      "<td>" +
      osDescription.detalhesOS +
      "</td>" +
      "</tr>" +
      "</table>";

    return result;
  }
};
