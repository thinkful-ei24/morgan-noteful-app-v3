const Tag = require('../models/tag');

const validateNoteId = (req, res, next) => {
  const possibleIds = [req.params.id, req.body.id];
  for (const id of possibleIds) {
    if (id) {
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        const err = new Error('Invalid (note) `id` submitted.');
        err.status = 400;
        return next(err);
      }
    }
  }
  return next();
};

const validateFolderId = (req, res, next) => {
  const possibleFolderIds = [req.query.folderId, req.body.folderId];
  for (const id of possibleFolderIds) {
    if (id) {
      if (!id.match(/^[0-9a-fA-F]{24}$/)) {
        const err = new Error('Invalid `folderId` submitted.');
        err.status = 400;
        return next(err);
      }
    }
  }
  return next();
};

const validateTagId = (req, res, next) => {
  if (req.body.tags !== undefined) {
    for (let i = 0; i < req.body.tags.length; i++) {
      const tag = req.body.tags[i];
      // First validate tag syntax
      if (!tag.match(/^[0-9a-fA-F]{24}$/)) {
        const err = new Error(`Invalid \`tagId\` at index ${i}.`);
        err.status = 400;
        return next(err);
      }
      // Then validate that tag exists
      // else {
      //   return Tag.findById(tag)
      //     .count()
      //     .then(dbRes => {
      //       if (dbRes !== 0) {
      //         const err = new Error(`Invalid \`tagId\` at index ${i}.`);
      //         err.status = 400;
      //         return next(err);
      //       }
      //     });
      // }
    }
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

module.exports = {requireFields, validateNoteId, validateTagId, validateFolderId, constructLocationHeader};