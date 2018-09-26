const express = require('express');
const router = express.Router();
const passport = require('passport');
// Integrate mongoose
const Note = require('../models/note');
// Validation Middleware
const { validateNoteId, validateFolderId, validateTagId, requireFields, constructLocationHeader } = require('../utils/route-middleware');

// Helpers
const constructNote = (fields, request) => {
  const body = request.body;
  const userId = request.user.id;
  const result = {userId};
  for (const field of fields) {
    if (field in body) {
      result[field] = body[field];
    }
  }
  return result;
};

// Protect endpoint
router.use('/', passport.authenticate('jwt', { session: false, failWithError: true }));

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', validateNoteId, (req, res, next) => {
  const {folderId, searchTerm, tagId} = req.query;
  const userId = req.user.id;
  // Add relevant filters to query
  let filter = { userId };
  if (tagId) filter.tags = tagId;
  if (folderId) filter.folderId = folderId;
  if (searchTerm) filter.title = { $regex: new RegExp(searchTerm, 'gi') };

  return Note.find(filter).sort({ updatedAt: 'desc' })
    .then(dbResponse => res.status(200).json(dbResponse))
    .catch(err => next(err));
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', validateNoteId, (req, res, next) => {
  const id = req.params.id;
  const userId = req.user.id;
  return Note.findOne({userId, _id: id})
    .then(dbResponse => {
      // Verify that a result is returned (ID exists in DB)
      if (!dbResponse) return next();
      else return res.status(200).json(dbResponse);
    })
    .catch(err => next(err));
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', validateNoteId, validateFolderId, validateTagId, requireFields(['title']), (req, res, next) => {
  const availableFields = ['title', 'content', 'folderId', 'tags'];
  // Construct the new note
  const newNote = constructNote(availableFields, req);
  return Note.create(newNote)
    .then(dbResponse => {
      // Verify that a result is returned (otherwise throw 500 error)
      if (!dbResponse) throw new Error();
      else return res.status(201).location(constructLocationHeader(req, dbResponse)).json(dbResponse);
    })
    .catch(err => next(err));
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', requireFields(['id']), validateNoteId, validateTagId, validateFolderId, (req, res, next) => {
  const id = req.params.id;
  // Validate that `id` matches ID in req.body
  if (!(id && req.body.id && id === req.body.id)) {
    const err = new Error('Request body `id` and parameter `id` must be equivalent.');
    err.status = 400;
    return next(err);
  }
  const updateFields = ['title', 'content', 'folderId', 'tags'];
  if (updateFields.tags === '') delete updateFields.tags;
  // Construct a note from updateFields
  const updatedNote = constructNote(updateFields, req);
  return Note.findByIdAndUpdate(id, updatedNote, { new: true })
    .then(dbResponse => {
      // Send 404 if no dbResponse
      if (!dbResponse) return next();
      else return res.status(200).json(dbResponse);
    })
    .catch(err => next(err));
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', validateNoteId, (req, res, next) => {
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