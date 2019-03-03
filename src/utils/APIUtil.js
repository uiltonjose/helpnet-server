module.exports = {
  handleResult: (result, res) => {
    res.status(result.code).send(JSON.stringify(result));
  }
};
