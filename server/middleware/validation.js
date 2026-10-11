const { isValidObjectId } = require('../utils/validators');

const validateIdParam = (paramName = 'id') => {
  return (req, res, next) => {
    const id = req.params[paramName];
    if (!id || !isValidObjectId(id)) {
      return res.status(400).json({
        success: false,
        message: `Invalid or missing ID parameter: ${paramName}`,
      });
    }
    next();
  };
};

module.exports = {
  validateIdParam,
};
