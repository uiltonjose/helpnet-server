module.exports = {
  handleResult: (result, res) => {
    res.status(result.code).json(result);
  }
};
