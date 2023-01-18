const express = require('express');
const auth = require('./auth/auth.routes');
const user = require('./user/user.routes');
const blog = require('./blog/blog.routes');

const router = express.Router();

router.use('/auth', auth);
router.use('/user', user);
router.use('/blog', blog);

router.get('/', (req, res) => {
  res.json({
    message: 'API - 👋🌎🌍🌏'
  });
});

module.exports = router;
