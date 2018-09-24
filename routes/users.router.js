const router = require('express').Router();
const User = require('../models/user');
const { requireFields, constructLocationHeader } = require('../utils/route-middleware');

router.post('/users', requireFields(['fullName', 'username', 'password']), (req, res, next) => {
  const newUser = {
    fullName: req.body.fullName,
    username: req.body.username,
    password: req.body.password
  };
  return User.create(newUser)
    .then(user => res
      .status(201)
      .location(constructLocationHeader(req, user))
      .json(user))
    .catch(err => next(err));
});

module.exports = router;