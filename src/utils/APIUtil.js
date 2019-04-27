const encryptUtil = require("../utils/EncryptUtil");
const statusCode = require("./StatusCode");

const handleResult = (result, res) => {
  res.status(result.code).json(result);
};

const validateToken = (req, res) => {
  const token = req.header("Authorization");
  encryptUtil.isValidToken(token).then(isValid => {
    if (!isValid) {
      res.status(statusCode.status.Forbidden).json({
        message: "It is not a valid token."
      });
    }
  });
};

module.exports = {
  handleResult: handleResult,
  validateToken: validateToken
};
