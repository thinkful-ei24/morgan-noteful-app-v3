'use strict';

const express = require('express');
// Integrate mongoose
const mongoose = require('mongoose');
const {
  MONGODB_URI
} = require('../config');
const Note = require('../models/note');
const connect = () => mongoose.connect(MONGODB_URI, {useNewUrlParser: true});
const disconnect = () => mongoose.disconnect();
const router = express.Router();

/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {

  connect()
    .then(() => {
      const searchTerm = req.query.searchTerm;
      let filter = {};

      if (searchTerm) {
        filter.title = {
          $regex: new RegExp(searchTerm, 'gi')
        };
      }

      return Note.find(filter).sort({
        updatedAt: 'desc'
      });
    })
    .then(results => {
      res.status(200).json(results);
    })
    .then(() => {
      return disconnect();
    })
    .catch(err => next(err));
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', (req, res, next) => {
  const id = req.params.id;
  // Verify that ID is a valid ID
  if (!id.match(/^[0-9a-fA-F]{24}$/)) {
    const err = new Error('Invalid `id` parameter.');
    err.status = 400;
    return next(err);
  }
  connect()
    .then(() => {
      return Note.findById(id);
    })
    .then(result => {
      // Verify that a result is returned (ID exists in DB)
      if (!result) return next();
      else return res.status(200).json(result);
    })
    .then(() => {
      return disconnect();
    })
    .catch(err => next(err));

});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', (req, res, next) => {

  console.log('Create a Note');
  res.location('path/to/new/document').status(201).json({
    id: 2,
    title: 'Temp 2'
  });

});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', (req, res, next) => {

  console.log('Update a Note');
  res.json({
    id: 1,
    title: 'Updated Temp 1'
  });

});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', (req, res, next) => {

  console.log('Delete a Note');
  res.status(204).end();
});

module.exports = router;