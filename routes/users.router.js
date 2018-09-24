const router = require('express').Router();
const User = require('../models/user');
const { requireFields, constructLocationHeader } = require('../utils/route-middleware');

router.post('/users', requireFields(['fullName', 'username', 'password']), (req, res, next) => {
  const { fullName, username, password } = req.body;
  const newUser = {
    fullName,
    username
  };
  return User.hashPassword(password)
    .then(digest => {
      newUser.password = digest;
      return User.create(newUser);
    })
    .then(user => res
      .status(201)
      .location(constructLocationHeader(req, user))
      .json(user))
    .catch(err => next(err));
});

module.exports = router;