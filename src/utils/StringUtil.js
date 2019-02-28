module.exports = {
  isNullOrEmpty: function isNullOrEmpty(value) {
    return value === undefined || value === null || value === "";
  },
  isInvalidNumer: function isValidNumer(value) {
    return (
      value === undefined || value === null || value === "" || isNaN(value)
    );
  }
};
