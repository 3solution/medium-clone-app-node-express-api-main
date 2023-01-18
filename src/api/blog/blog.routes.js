const express = require('express');
const uniqid = require('uniqid');
const slug = require('slug');

const { validateBlogParams, validateCommentParams } = require('../../utils/validation');
const { isAuthenticated } = require('../../middlewares');
const {
  createBlog, addComment, readBlog, readOne
} = require('./blog.services');

const router = express.Router();

router.post('/create', isAuthenticated, async (req, res, next) => {
  try {
    const validation = validateBlogParams(req.body);
    if (!validation.is_valid) {
      res.status(400);
      throw new Error(validation.error_msgs);
    }
    const {
      title,
      banner,
      description,
      content,
    } = req.body;
    const { userId } = req.payload;
    const titleSlug = uniqid.process(`${slug(title, '_')}_`);
    await createBlog({
      userId, title, banner, description, content, slug: titleSlug
    });

    res.json({
      message: 'Adding Blog was successful'
    });
  } catch (err) {
    next(err);
  }
});

router.post('/add_comment', isAuthenticated, async (req, res, next) => {
  try {
    const validation = validateCommentParams(req.body);
    if (!validation.is_valid) {
      res.status(400);
      throw new Error(validation.error_msgs);
    }
    const {
      blogId,
      comment
    } = req.body;
    const { userId } = req.payload;
    await addComment({
      userId, blogId, comment
    });

    res.json({
      message: 'Adding Blog was successful'
    });
  } catch (err) {
    next(err);
  }
});

router.get('/read', async (req, res, next) => {
  try {
    const bloglist = await readBlog();
    res.json(bloglist);
  } catch (err) {
    next(err);
  }
});

router.get('/read_one', async (req, res, next) => {
  try {
    const { blogSlug } = req.body;
    const blogdetail = await readOne(blogSlug);
    res.json(blogdetail);
  } catch (err) {
    next(err);
  }
});
module.exports = router;
