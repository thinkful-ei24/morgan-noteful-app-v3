const express = require('express');
const router = express.Router();
// Integrate mongoose
const Tag = require('../models/tag');
const Note = require('../models/note');
const { validateId, validateFields, constructLocationHeader } = require('../utils/route-middleware');


/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  return Tag.find()
    .sort('name')
    .then(dbRes => res.status(200).json(dbRes))
    .catch(err => next(err));
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', validateId, (req, res, next) => {
  const id = req.params.id;
  return Tag.findById(id)
    .then(dbRes => {
      if (!dbRes) return next();
      else return res.status(200).json(dbRes);
    })
    .catch(err => next(err));
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', validateFields(['name']), (req, res, next) => {
  const newItem = {name: req.body.name};
  return Tag.create(newItem)
    .then(dbRes => {
      if (!dbRes) throw new Error();
      else return res.status(201).location(constructLocationHeader(req, dbRes)).json(dbRes);
    })
    .catch(err => {
      if (err.code === 11000) {
        const error = new Error(`Tag \`${newItem.name}\` already exists (name must be unique).`);
        error.status = 400;
        return next(error);
      }
      else return next(err);
    });
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', validateId, validateFields(['id', 'name']), (req, res, next) => {
  const id = req.params.id;
  const validFields = ['id', 'name'];
  if (!(id && req.body.id && id === req.body.id)) {
    const err = new Error('Request body `id` and parameter `id` must be equivalent.');
    err.status = 400;
    return next(err);
  }
  const item = {};
  for (const field of validFields) {
    if (field in req.body) {
      item[field] = req.body[field];
    }
  }
  return Tag.findByIdAndUpdate(id, item, {new: true})
    .then(dbRes => {
      if (!dbRes) return next();
      else return res.status(200).json(dbRes);
    })
    .catch(err => next(err));
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', validateId, (req, res, next) => {
  const id = req.params.id;
  // Delete folder from Folder DB
  return Tag.findByIdAndDelete(id)
    .then((dbRes) => {
      if (!dbRes) return next();
      else return Note.updateMany({}, {$pull: {tags: id}});
    })
    // Unset corresponding tag from Note entries
    .then(dbRes => {
      if (!dbRes) return next();
      else return res.status(204).end();
    })
    .catch(err => next(err));
});


module.exports = router;