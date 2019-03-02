module.exports = {
  isNullOrEmpty: function isNullOrEmpty(value) {
    return value === undefined || value === null || value === "";
  },
  isInvalidNumer: function isInValidNumer(value) {
    return (
      value === undefined || value === null || value === "" || isNaN(value)
    );
  }
};
