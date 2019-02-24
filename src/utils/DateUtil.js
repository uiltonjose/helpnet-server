const nodemailer = require("nodemailer");
require("dotenv").config();

module.exports = {
  getDateString: function getDateString() {
    let date = new Date();
    let hour = date.getHours();
    if (hour < 10) {
      hour = "0" + hour;
    }
    let min = date.getMinutes();
    if (min < 10) {
      min = "0" + min;
    }
    let sec = date.getSeconds();
    if (sec < 10) {
      sec = "0" + sec;
    }
    let day = date.getDay();
    if (day < 10) {
      day = "0" + day;
    }
    let mon = date.getMonth();
    if (mon < 10) {
      mon = "0" + mon;
    }
    let year = date.getFullYear();

    return (dateString =
      hour + ":" + min + ":" + sec + " de " + day + "/" + mon + "/" + year);
  }
};
