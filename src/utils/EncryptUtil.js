const CryptoJS = require("crypto-js");

const encryptString = cipherInput => {
  const cipher = CryptoJS.AES.encrypt(
    cipherInput,
    process.env.ENCRYPT_SECRECT_KEY || "dev"
  );
  return cipher.toString();
};

const decryptString = cipherInput => {
  var bytes = CryptoJS.AES.decrypt(
    cipherInput,
    process.env.ENCRYPT_SECRECT_KEY || "dev"
  );
  return bytes.toString(CryptoJS.enc.Utf8);
};

module.exports = {
  encryptString: encryptString,
  decryptString: decryptString
};
