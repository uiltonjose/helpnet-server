const CryptoJS = require("crypto-js");

const encryptString = cipherInput => {
  const cipher = CryptoJS.AES.encrypt(
    cipherInput,
    "speedupServersolution$olusp33d"
  );
  return cipher.toString();
};

const decryptString = cipherInput => {
  var bytes = CryptoJS.AES.decrypt(
    cipherInput,
    "speedupServersolution$olusp33d"
  );
  return bytes.toString(CryptoJS.enc.Utf8);
};

module.exports = {
  encryptString: encryptString,
  decryptString: decryptString
};
