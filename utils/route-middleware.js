const validateNoteId = (req, res, next) => {
  const possibleIds = [req.params.id, req.body.id];
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

const validateFolderId = (req, res, next) => {
  const possibleIds = [req.body.folderId];
  for (const id of possibleIds) {
    if (id) {
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        const err = new Error('Invalid `folderId` parameter.');
        err.status = 400;
        return next(err);
      }
    }
  }
  return next();
};

const validateTagId = (req, res, next) => {
  if (req.body.tags !== undefined) {
    const tagsLength = req.body.tags.length || 0;
    for (let i = 0; i < tagsLength; i++) {
      const id = req.body.tags[i];
      if (id) {
        if (!id.match(/^[0-9a-fA-F]{24}$/)) {
          const err = new Error(`Invalid tag \`id\` parameter at index ${i}.`);
          err.status = 400;
          return next(err);
        }
      }
    }
  }
  return next();
};

const validateUser = (req, res, next) => {
  const { username, password } = req.body;
  // Require username and password to be strings
  if (!(typeof username === 'string' && typeof password === 'string')) {
    const err = new Error('`username` and `password` must be of type string.');
    err.status = 400;
    return next(err);
  }
  if (username.length < 1) {
    const err = new Error('Username must be at least one character long.');
    err.status = 400;
    return next(err);
  }
  if (password.length < 8 || password.length > 72) {
    const err = new Error('Password must be between 8 and 72 characters long.');
    err.status = 400;
    return next(err);
  }
  // Require no leading or trailing whitespace
  if(username[0] === ' ' || 
    username[username.length - 1] === ' ' || 
    password[0] === ' ' || 
    password[password.length - 1] === ' ') {
    const err = new Error('Username and password cannot begin or end with a space.');
    err.status = 400;
    return next(err);
  }
  return next();
};

const requireFields = (requiredFields) => (req, res, next) => {
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

module.exports = {requireFields, validateTagId, validateFolderId, validateNoteId, validateUser, constructLocationHeader};