const validateId = (req, res, next) => {
  const id = req.params.id;
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    const err = new Error('Invalid `id` parameter.');
    err.status = 400;
    return next(err);
  }
  return next();
};

const validateFields = (requiredFields) => (req, res, next) => {
  for (const field of requiredFields) {
    if (!(field in req.body)) {
      const err = new Error(`Missing \`${field}\` in request body.`);
      err.status = 400;
      return next(err);
    }
  }
  return next();
};

module.exports = {validateFields, validateId};