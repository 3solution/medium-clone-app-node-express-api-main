const { db } = require('../../utils/db');

function createBlog(blog) {
  return db.blog.create({
    data: blog,
  });
}
function addComment(comment) {
  return db.comment.create({
    data: comment,
  });
}

function readBlog() {
  return db.blog.findMany({
    select: {
      userId: true,
      title: true,
      description: true,
      slug: true
    }
  });
}

function readOne(blogSlug) {
  return db.blog.findUnique({
    where: {
      slug: blogSlug,
    },
    select: {
      id: true,
      userId: true,
      title: true,
      description: true,
      slug: true,
      banner: true,
      content: true,
      createdAt: true,
      updatedAt: true,
      Comment: {
        select: {
          id: true,
          userId: true,
          comment: true,
          createdAt: true,
          updatedAt: true,
        }
      }
    }
  });
}

module.exports = {
  createBlog,
  readBlog,
  readOne,
  addComment,
};
