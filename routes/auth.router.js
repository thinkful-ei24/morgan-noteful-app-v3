const router = require('express').Router();
const passport = require('passport');

// Setup passport authentication
const options = {session: false, failWithError: true};
const localAuth = passport.authenticate('local', options);

router.post('/login', localAuth, function (req, res) {
  return res.json(req.user);
});

module.exports = router;