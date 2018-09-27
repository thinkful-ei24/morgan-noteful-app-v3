const router = require('express').Router();
const User = require('../models/user');
const { requireFields, validateUser, constructLocationHeader } = require('../utils/route-middleware');

router.post('/users', requireFields(['username', 'password'], 422), validateUser, (req, res, next) => {
  const possibleFields = ['username', 'password', 'fullname'];
  const newUser = {};
  for (const field of possibleFields) {
    if (field in req.body) newUser[field] = req.body[field];
  }
  return User.hashPassword(newUser.password)
    .then(digest => {
      newUser.password = digest;
      return User.create(newUser);
    })
    .then(user => res
      .status(201)
      .location(constructLocationHeader(req, user))
      .json(user))
    .catch(err => {
      if (err.code === 11000) {
        err = new Error('The username already exists');
        err.status = 400;
      }
      next(err);
    });
});

module.exports = router;