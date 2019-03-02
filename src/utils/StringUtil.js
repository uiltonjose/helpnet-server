module.exports = {
  isNullOrEmpty: function isNullOrEmpty(value) {
    return value === undefined || value === null || value === "";
  },
  isNotValidNumber: function isNotValidNumber(value) {
    return (
      value === undefined || value === null || value === "" || isNaN(value)
    );
  }
};
