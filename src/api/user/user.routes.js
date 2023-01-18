const express = require('express');
const uniqid = require('uniqid');

const { findUser, filterUser, updateUser } = require('./user.services');
const { isAuthenticated } = require('../../middlewares');
const { revokeTokens } = require('../auth/auth.services');

const router = express.Router();

router.get('/profile', isAuthenticated, async (req, res, next) => {
  try {
    const { userId } = req.payload;
    const user = await findUser({ id: userId });
    res.json({
      data: {
        user: filterUser({ ...user })
      }
    });
  } catch (err) {
    next(err);
  }
});

router.post('/update', isAuthenticated, async (req, res, next) => {
  try {
    const { userId } = req.payload;
    const user = await findUser({ id: userId });
    const data = req.body;
    const reminder = user.email === data.email ? await updateUser(
      {
        id: userId
      },
      {
        ...data,
      }
    ) : await updateUser(
      {
        id: userId
      },
      {
        ...data,
        phoneverified: null,
      }
    );
    res.json({
      message: 'The profile has been successfully updated',
      data: reminder,
    });
  } catch (err) {
    next(err);
  }
});

router.post('/delete', isAuthenticated, async (req, res, next) => {
  try {
    const { userId } = req.payload;
    const { reasonOfDeletion } = req.body;
    await updateUser(
      {
        id: userId
      },
      {
        email: uniqid.process(),
        phone: uniqid.process(),
        firstname: '',
        lastname: '',
        gender: '',
        dateOfDeletion: new Date(),
        isDeleted: true,
        reasonOfDeletion: parseInt(reasonOfDeletion, 10),
      }
    );
    await revokeTokens(userId);
    res.json({
      message: 'The user account has been successfully deleted.',
    });
  } catch (err) {
    next(err);
  }
});

module.exports = router;
