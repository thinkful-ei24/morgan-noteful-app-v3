const express = require('express');
const router = express.Router();
// Integrate mongoose
const Tag = require('../models/tag');
const { validateId, validateFields, constructLocationHeader } = require('../utils/route-middleware');


/* ========== GET/READ ALL ITEMS ========== */
router.get('/', (req, res, next) => {

});

/* ========== GET/READ A SINGLE ITEM ========== */
router.get('/:id', validateId, (req, res, next) => {

});

/* ========== POST/CREATE AN ITEM ========== */
router.post('/', validateFields([]), (req, res, next) => {

});

/* ========== PUT/UPDATE A SINGLE ITEM ========== */
router.put('/:id', validateId, validateFields([]), (req, res, next) => {

});

/* ========== DELETE/REMOVE A SINGLE ITEM ========== */
router.delete('/:id', validateId, (req, res, next) => {

});


module.exports = router;