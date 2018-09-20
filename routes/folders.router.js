const express = require('express');
const router = express.Router();
// Integrate mongoose
const Folder = require('../models/folder');
const { validateId, validateFields } = require('../utils/validate');


/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {
  return Folder.find()
    .sort('name')
    .then(dbRes => {
      return res.status(200).json(dbRes);
    });
});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', validateId, (req, res, next) => {
  const id = req.params.id;
  return Folder.findById(id)
    .then(dbRes => {
      if (!dbRes) return next();
      else return res.status(200).json(dbRes);
    });
});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', validateFields(), (req, res, next) => {
  
});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', validateId, validateFields(), (req, res, next) => {
  
});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', validateId, (req, res, next) => {
  
});


module.exports = router;