const express = require('express');
const router = express.Router();
// Integrate mongoose
const Note = require('../models/note');
// Validation Middleware
const { validateIds, validateFields, constructLocationHeader } = require('../utils/route-middleware');

// Helpers
const constructNote = (fields, request) => {
  const result = {};
  for (const field of fields) {
    if (field in request) {
      result[field] = request[field];
    }
  }
  return result;
};

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', validateIds, (req, res, next) => {
  const {folderId, searchTerm, tagId} = req.query;
  // Add relevant filters to query
  let filter = {};
  if (tagId) filter.tags = tagId;
  if (folderId) filter.folderId = folderId;
  if (searchTerm) filter.title = { $regex: new RegExp(searchTerm, 'gi') };

  return Note.find(filter).sort({ updatedAt: 'desc' })
    .then(dbResponse => res.status(200).json(dbResponse))
    .catch(err => next(err));
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', validateIds, (req, res, next) => {
  const id = req.params.id;
  return Note.findById(id)
    .then(dbResponse => {
      // Verify that a result is returned (ID exists in DB)
      if (!dbResponse) return next();
      else return res.status(200).json(dbResponse);
    })
    .catch(err => next(err));
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', validateIds, validateFields(['title']), (req, res, next) => {
  const availableFields = ['title', 'content', 'folderId'];
  // Construct the new note
  const newNote = constructNote(availableFields, req.body);
  return Note.create(newNote)
    .then(dbResponse => {
      // Verify that a result is returned (otherwise throw 500 error)
      if (!dbResponse) throw new Error();
      else return res.status(201).location(constructLocationHeader(req, dbResponse)).json(dbResponse);
    })
    .catch(err => next(err));
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', validateFields(['id']), validateIds, (req, res, next) => {
  const id = req.params.id;
  // Validate that `id` matches ID in req.body
  if (!(id && req.body.id && id === req.body.id)) {
    const err = new Error('Request body `id` and parameter `id` must be equivalent.');
    err.status = 400;
    return next(err);
  }
  const updateFields = ['title', 'content', 'folderId'];
  // Construct a note from updateFields
  const updatedNote = constructNote(updateFields, req.body);
  // Validate ID and required fields. If correct, send request.
  return Note.findByIdAndUpdate(id, updatedNote, { new: true })
    .then(dbResponse => {
      // Send 404 if no dbResponse
      if (!dbResponse) return next();
      else return res.status(200).json(dbResponse);
    })
    .catch(err => next(err));
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', validateIds, (req, res, next) => {
  const id = req.params.id;
  return Note.findByIdAndDelete(id)
    .then(dbResponse => {
      // Verify an item was deleted. If not, send 404.
      if (!dbResponse) return next();
      else return res.status(204).end();
    })
    .catch(err => next(err));
});

module.exports = router;