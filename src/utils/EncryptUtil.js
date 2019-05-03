const CryptoJS = require("crypto-js");
const jwt = require("jsonwebtoken");

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
  const bytes = CryptoJS.AES.decrypt(
    cipherInput,
    process.env.ENCRYPT_SECRECT_KEY
  );
  return bytes.toString(CryptoJS.enc.Utf8);
};

const generateAccessToken = data => {
  return jwt.sign(data, process.env.ENCRYPT_SECRECT_KEY); // If we need to make the token expirable, add this: {expiresIn: 120};
};

const isValidToken = token => {
  return new Promise(resolve => {
    jwt.verify(token, process.env.ENCRYPT_SECRECT_KEY, error => {
      if (!error) {
        resolve(true);
      } else {
        resolve(false);
      }
    });
  });
};

module.exports = {
  encryptString: encryptString,
  decryptString: decryptString,
  generateAccessToken: generateAccessToken,
  isValidToken: isValidToken
};
