const validateId = (req, res, next) => {
  const possibleIds = [req.params.id, req.body.id, req.query.folderId, req.body.folderId];
  for (const id of possibleIds) {
    if (id) {
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        const err = new Error('Invalid `id` parameter.');
        err.status = 400;
        return next(err);
      }
  }
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

const constructLocationHeader = (req, res) => {
  let url = req.originalUrl;
  const lastIndex = url.length - 1;
  if (url[lastIndex] === '/') url = url.slice(0, lastIndex);
  return `${url}/${res.id}`;
};

module.exports = {validateFields, validateId, constructLocationHeader};