const express = require('express');
const router = express.Router();
// Integrate mongoose
const Note = require('../models/note');

// HELPERS
const hasInvalidId = (id, next) => {
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    const err = new Error('Invalid `id` parameter.');
    err.status = 400;
    next(err);
    return true;
  }
  return false;
};

const hasMissingField = (requiredFields, request, next) => {
  for (const field of requiredFields) {
    if (!(field in request)) {
      const err = new Error(`Missing \`${field}\` in request body.`);
      err.status = 400;
      next(err);
      return true;
    }
  }
  return false;
};

const constructNote = (fields, request) => {
  const result = {};
  for (const field of fields) {
    if (field in request) {
      result[field] = request[field];
    }
  }
  return result;
};

const constructNewLocation = (req, res) => {
  let url = req.originalUrl;
  const lastIndex = url.length - 1;
  if (url[lastIndex] === '/') url = url.slice(0, lastIndex);
  return `${url}/${res.id}`;
};

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  const searchTerm = req.query.searchTerm;
  let filter = {};

  if (searchTerm) {
    filter.title = {
      $regex: new RegExp(searchTerm, 'gi')
    };
  }

  return Note.find(filter).sort({ updatedAt: 'desc' })
    .then(dbResponse => res.status(200).json(dbResponse))
    .catch(err => next(err));
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const id = req.params.id;
  // Verify that ID is a valid ID. If it is, proceeds with DB call.
  return hasInvalidId(id, next) || Note.findById(id)
    .then(dbResponse => {
      // Verify that a result is returned (ID exists in DB)
      if (!dbResponse) return next();
      else return res.status(200).json(dbResponse);
    })
    .catch(err => next(err));
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {
  const requiredFields = ['title'];
  const availableFields = ['title', 'content'];
  // Construct the new note
  const newNote = constructNote(availableFields, req.body);
  // Verify that all required fields are present. If so, proceeds with DB call.
  return hasMissingField(requiredFields, req.body, next) || 
    Note.create(newNote)
      .then(dbResponse => {
        // Verify that a result is returned (otherwise throw 500 error)
        if (!dbResponse) throw new Error();
        else return res.status(201).location(constructNewLocation(req, dbResponse)).json(dbResponse);
      })
      .catch(err => next(err));
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {
  const requiredFields = ['id', 'title'];
  const updateFields = ['title', 'content'];
  const id = req.params.id;
  // Validate that `id` matches ID in req.body
  if (!(id && req.body.id && id === req.body.id)) {
    const err = new Error('Request body `id` and parameter `id` must be equivalent');
    err.status = 400;
    return next(err);
  }
  // Construct a note from updateFields
  const updatedNote = constructNote(updateFields, req.body);
  // Validate ID and required fields. If correct, send request.
  return hasMissingField(requiredFields, req.body, next) ||
    hasInvalidId(id, next) || 
    Note.findByIdAndUpdate(id, updatedNote, { new: true })
      .then(dbResponse => {
        // Send 404 if no dbResponse
        if (!dbResponse) return next();
        else return res.status(200).json(dbResponse);
      })
      .catch(err => next(err));
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {
  const id = req.params.id;
  // Validate ID. If valid, send request.
  return hasInvalidId(id, next) || 
    Note.findByIdAndDelete(id)
      .then(dbResponse => {
        // Verify an item was deleted. If not, send 404.
        if (!dbResponse) return next();
        else return res.status(204).end();
      })
      .catch(err => next(err));
});

module.exports = router;