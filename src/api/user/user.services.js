const bcrypt = require('bcrypt');
const { db } = require('../../utils/db');

function findUser(cond) {
  return db.user.findUnique({
    where: cond,
  });
}

function createUser(user) {
  user.password = bcrypt.hashSync(user.password, 12);
  return db.user.create({
    data: user,
  });
}

function updateUser(cond, data) {
  return db.user.update({
    where: cond,
    data,
  });
}

function filterUser(user) {
  delete user.password;
  return user;
}
module.exports = {
  findUser,
  createUser,
  updateUser,
  filterUser
};
