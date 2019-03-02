/*
SQLyog Community Edition- MySQL GUI v6.15
MySQL - 5.1.48-community : Database - helpnet
*********************************************************************
*/


/*!40101 SET NAMES utf8 */;

/*!40101 SET SQL_MODE=''*/;

create database if not exists `helpnet`;

USE `helpnet`;

/*!40014 SET @OLD_FOREIGN_KEY_CHECKS=@@FOREIGN_KEY_CHECKS, FOREIGN_KEY_CHECKS=0 */;
/*!40101 SET @OLD_SQL_MODE=@@SQL_MODE, SQL_MODE='NO_AUTO_VALUE_ON_ZERO' */;

/*Table structure for table `cliente` */

DROP TABLE IF EXISTS `cliente`;

CREATE TABLE `cliente` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `nome` varchar(100) NOT NULL,
  `cpf_cnpj` varchar(14) NOT NULL,
  `PROVIDER_ID` bigint(20) NOT NULL,
  `nome_res` varchar(100) DEFAULT NULL,
  `fone` varchar(100) DEFAULT NULL,
  `celular` varchar(100) DEFAULT NULL,
  `login` varchar(100) DEFAULT NULL,
  `email` varchar(100) DEFAULT NULL,
  `endereco` varchar(100) DEFAULT NULL,
  `numero` varchar(100) DEFAULT NULL,
  `bairro` varchar(100) DEFAULT NULL,
  `cidade` varchar(100) DEFAULT NULL,
  `estado` varchar(100) DEFAULT NULL,
  `cep` varchar(100) DEFAULT NULL,
  `bloqueado` varchar(100) NOT NULL,
  `cli_ativado` varchar(100) NOT NULL,
  `data_inclusao` datetime DEFAULT NULL,
  `data_atualizacao` datetime DEFAULT NULL,
  `cadastro` varchar(20) DEFAULT NULL,
  `plano` varchar(50) DEFAULT NULL,
  `complemento` varchar(255) DEFAULT NULL,
  `bloqueio_abrir_os` char(20) NOT NULL DEFAULT 'false',
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `evento` */

DROP TABLE IF EXISTS `evento`;

CREATE TABLE `evento` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `DATA_HORA` datetime NOT NULL,
  `OS_ID` bigint(20) NOT NULL,
  `TIPO_EVENTO_ID` bigint(20) NOT NULL,
  `OBSERVACAO` varchar(255) DEFAULT NULL,
  `USUARIO_ID` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`ID`),
  KEY `FK_OS_ID` (`OS_ID`),
  KEY `FK_TIPO_EVENTO_ID` (`TIPO_EVENTO_ID`),
  KEY `FK_USUARIO` (`USUARIO_ID`),
  CONSTRAINT `FK_OS_ID` FOREIGN KEY (`OS_ID`) REFERENCES `os` (`ID`),
  CONSTRAINT `FK_USUARIO` FOREIGN KEY (`USUARIO_ID`) REFERENCES `usuario` (`ID`),
  CONSTRAINT `FK_TIPO_EVENTO_ID` FOREIGN KEY (`TIPO_EVENTO_ID`) REFERENCES `tipo_evento` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `notificacao` */

DROP TABLE IF EXISTS `notificacao`;

CREATE TABLE `notificacao` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `titulo` varchar(50) NOT NULL,
  `mensagem` varchar(255) NOT NULL,
  `data_envio` datetime NOT NULL,
  `provider_id` bigint(20) DEFAULT NULL,
  `usuario_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `notificacao_cliente` */

DROP TABLE IF EXISTS `notificacao_cliente`;

CREATE TABLE `notificacao_cliente` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `notificacaoId` bigint(20) DEFAULT NULL,
  `clienteId` bigint(20) DEFAULT NULL,
  `status` char(1) DEFAULT NULL,
  `dataInclusao` datetime DEFAULT NULL,
  `dataUltimaAlteracao` datetime DEFAULT NULL,
  PRIMARY KEY (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;									 
/*Table structure for table `os` */

DROP TABLE IF EXISTS `os`;

CREATE TABLE `os` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `NUMERO` bigint(20) NOT NULL,
  `DATA_ABERTURA` datetime NOT NULL,
  `CLIENTE_ID` bigint(20) NOT NULL,
  `PROBLEMA_ID` bigint(20) DEFAULT NULL,
  `DETALHES` varchar(255) DEFAULT NULL,
  `OBSERVACAO` varchar(255) DEFAULT NULL,
  `CLIENTE_NAO_CADASTRADO` varchar(255) DEFAULT NULL,
  `USUARIO_ID` bigint(20) DEFAULT NULL,
  `SITUACAO_ID` bigint(20) NOT NULL,
  `PROVEDOR_ID` bigint(20) NOT NULL,
  PRIMARY KEY (`ID`),
  KEY `FK_PROVEDOR_ID` (`PROVEDOR_ID`),
  KEY `FK_SITUACAO_ID` (`SITUACAO_ID`),
  KEY `FK_TECNICO_ID` (`USUARIO_ID`),
  KEY `FK_PROBLEMA_ID` (`PROBLEMA_ID`),
  KEY `FK_CLIENTE_ID` (`CLIENTE_ID`),
  CONSTRAINT `FK_CLIENTE_ID` FOREIGN KEY (`CLIENTE_ID`) REFERENCES `cliente` (`id`),
  CONSTRAINT `FK_PROBLEMA_ID` FOREIGN KEY (`PROBLEMA_ID`) REFERENCES `problema_os` (`ID`),
  CONSTRAINT `FK_PROVEDOR_ID` FOREIGN KEY (`PROVEDOR_ID`) REFERENCES `provedor` (`ID`),
  CONSTRAINT `FK_SITUACAO_ID` FOREIGN KEY (`SITUACAO_ID`) REFERENCES `situacao_os` (`ID`),
  CONSTRAINT `FK_USUARIO_ID` FOREIGN KEY (`USUARIO_ID`) REFERENCES `usuario` (`id`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `perfil` */

DROP TABLE IF EXISTS `perfil`;

CREATE TABLE `perfil` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `NOME` varchar(50) NOT NULL,
  `DESCRICAO` varchar(50) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `problema_os` */

DROP TABLE IF EXISTS `problema_os`;

CREATE TABLE `problema_os` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `TITULO` varchar(100) NOT NULL,
  `DESCRICAO` varchar(255) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `provedor` */

DROP TABLE IF EXISTS `provedor`;

CREATE TABLE `provedor` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `NOME` varchar(50) NOT NULL,
  `DESCRICAO` varchar(255) NOT NULL,
  `SITUACAO` char(15) NOT NULL,
  `BD_NOME` varchar(100) DEFAULT NULL,
  `BD_URL` varchar(100) DEFAULT NULL,
  `BD_PORTA` varchar(10) DEFAULT NULL,
  `BD_USUARIO` varchar(100) DEFAULT NULL,
  `BD_SENHA` varchar(100) DEFAULT NULL,
  `BD_TABLE` varchar(50) DEFAULT NULL,
  `BD_COLUMN_IDENTIFY` varchar(100) DEFAULT NULL,
  `BD_SELECT` varchar(255) DEFAULT NULL,
  `EMAIL` varchar(255) DEFAULT NULL,
  `TELEFONE_CONTATO` varchar(20) DEFAULT NULL,
  `CELULAR_CONTATO` varchar(20) DEFAULT NULL,
  `EMAIL_ENVIO_OS` varchar(255) DEFAULT NULL,
  `LOGO` varchar(255) DEFAULT NULL,
  `CODIGO` int(11) DEFAULT NULL,
  `CODIGO_CLIENTE` int(11) DEFAULT NULL,									
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `situacao_os` */

DROP TABLE IF EXISTS `situacao_os`;

CREATE TABLE `situacao_os` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `SITUACAO` varchar(255) DEFAULT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `tecnico` */

DROP TABLE IF EXISTS `tecnico`;

CREATE TABLE `tecnico` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `NOME` varchar(100) NOT NULL,
  `CPF` varchar(11) NOT NULL,
  `USUARIO_ID` bigint(20) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `tipo_evento` */

DROP TABLE IF EXISTS `tipo_evento`;

CREATE TABLE `tipo_evento` (
  `ID` bigint(20) NOT NULL AUTO_INCREMENT,
  `EVENTO` varchar(100) NOT NULL,
  `DESCRICAO` varchar(255) NOT NULL,
  PRIMARY KEY (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*Table structure for table `usuario` */

DROP TABLE IF EXISTS `usuario`;

CREATE TABLE `usuario` (
  `id` bigint(20) NOT NULL AUTO_INCREMENT,
  `login` varchar(50) NOT NULL,
  `perfil` varchar(50) NOT NULL,
  `status` varchar(50) NOT NULL,
  `provedor_id` bigint(20) DEFAULT NULL,
  PRIMARY KEY (`id`),
  KEY `FK_PROV_ID` (`provedor_id`),
  CONSTRAINT `FK_PROV_ID` FOREIGN KEY (`provedor_id`) REFERENCES `provedor` (`ID`)
) ENGINE=InnoDB DEFAULT CHARSET=latin1;

/*!40101 SET SQL_MODE=@OLD_SQL_MODE */;
/*!40014 SET FOREIGN_KEY_CHECKS=@OLD_FOREIGN_KEY_CHECKS */;
