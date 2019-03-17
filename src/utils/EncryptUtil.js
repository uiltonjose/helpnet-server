const CryptoJS = require("crypto-js");

const encryptString = cipherInput => {
  const cipher = CryptoJS.AES.encrypt(
    cipherInput,
    process.env.ENCRYPT_SECRECT_KEY
  );

  /**
   * We generate a new cipher in case of the cipher contains symbol +.
   * The reason is to avoid break the decrypt string. This is a workaround, finding a better way to do this.
   */
  if (cipher.toString().includes("+")) {
    return encryptString(cipherInput);
  }
  return cipher.toString();
};

const decryptString = cipherInput => {
  var bytes = CryptoJS.AES.decrypt(
    cipherInput,
    process.env.ENCRYPT_SECRECT_KEY
  );
  return bytes.toString(CryptoJS.enc.Utf8);
};

module.exports = {
  encryptString: encryptString,
  decryptString: decryptString
};
