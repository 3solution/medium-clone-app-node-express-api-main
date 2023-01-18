const express = require('express');
const uniqid = require('uniqid');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');

const { generateTokens } = require('../../utils/jwt');
const { hashToken } = require('../../utils/hashToken');
const { validateRegisterParams } = require('../../utils/validation');

const {
  addRefreshTokenToWhitelist,
  findRefreshTokenById,
  deleteRefreshToken,
  revokeTokens,
} = require('./auth.services');
const {
  createUser,
  findUser,
  updateUser,
  filterUser,
} = require('../user/user.services');

const router = express.Router();

router.post('/register', async (req, res, next) => {
  try {
    const validation = validateRegisterParams(req.body);
    if (!validation.is_valid) {
      res.status(400);
      throw new Error(validation.error_msgs);
    }

    const {
      email,
      password,
      phone,
      firstname,
      lastname
    } = req.body;

    const existingUser = await findUser({ email });

    if (existingUser) {
      res.status(400);
      throw new Error('There is already a user account with the specified email');
    }

    const user = await createUser({
      email, password, phone, firstname, lastname
    });

    res.json({
      message: 'Registration was successful',
      data: {
        user: filterUser({ ...user }),
      }
    });
  } catch (err) {
    next(err);
  }
});

router.post('/login', async (req, res, next) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400);
      throw new Error('Please enter an email and a password');
    }

    const existingUser = await findUser({ email });

    if (!existingUser) {
      res.status(403);
      throw new Error('The email is not a valid email address');
    }

    const validPassword = await bcrypt.compare(password, existingUser.password);

    if (!validPassword) {
      res.status(403);
      throw new Error('Wrong password.Try again or click Forgot password to reset it.');
    }

    const jti = uniqid.process();

    const { accessToken, refreshToken } = generateTokens(existingUser.id, jti);
    await addRefreshTokenToWhitelist({ jti, refreshToken, userId: existingUser.id });

    res.json({
      message: 'ok',
      data: {
        token: {
          accessToken,
          refreshToken,
        },
        user: filterUser({ ...existingUser }),
      }
    });
  } catch (err) {
    next(err);
  }
});

router.post('/refreshToken', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    if (!refreshToken) {
      res.status(400);
      throw new Error('Missing refresh token.');
    }

    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);

    const savedRefreshToken = await findRefreshTokenById(payload.jti);

    if (!savedRefreshToken) {
      res.status(401);
      throw new Error('Unauthorized');
    }

    const hashedToken = hashToken(refreshToken);
    if (hashedToken !== savedRefreshToken.hashedToken) {
      res.status(401);
      throw new Error('Unauthorized');
    }

    const user = await findUser({ id: payload.userId });
    if (!user) {
      res.status(401);
      throw new Error('Unauthorized');
    }

    await deleteRefreshToken(savedRefreshToken.id);
    const jti = uniqid();
    const { accessToken, refreshToken: newRefreshToken } = generateTokens(user.id, jti);
    await addRefreshTokenToWhitelist({ jti, refreshToken: newRefreshToken, userId: user.id });

    res.json({
      message: 'refreshToken generated newly.',
      data: {
        token: {
          accessToken,
          refreshToken: newRefreshToken,
        },
        user: filterUser({ ...user })
      }
    });
  } catch (err) {
    next(err);
  }
});

router.post('/revokeRefreshTokens', async (req, res, next) => {
  try {
    const { refreshToken } = req.body;
    const payload = jwt.verify(refreshToken, process.env.JWT_REFRESH_SECRET);
    await revokeTokens(payload.userId);
    res.json({ message: `Tokens revoked for user with id #${payload.userId}` });
  } catch (err) {
    next(err);
  }
});

router.post('/resetPassword', async (req, res, next) => {
  try {
    const { phone, phonecode, password } = req.body;

    if (!phone || !phonecode || !password) {
      res.status(400);
      throw new Error('Please Verify Input');
    }

    const existingUser = await findUser({ phone });

    if (!existingUser) {
      res.status(400);
      throw new Error('phoneNumber was not found');
    }

    if (!existingUser.phoneverified) {
      res.status(400);
      throw new Error('The phone number has not yet been confirmed');
    }

    const decoded = jwt.verify(existingUser.phonecode, process.env.JWT_ACCESS_SECRET);
    if (decoded.code === phonecode) {
      await updateUser({ phone }, { password: bcrypt.hashSync(password, 12) });
      res.json({
        message: 'The password was changed successfully.',
      });
    } else {
      res.status(403);
      throw new Error('The password has not been changed.');
    }
  } catch (err) {
    if (err.name === 'TokenExpiredError') {
      res.status(403);
      err.message = 'The confirmation code is no longer valid.';
    }
    next(err);
  }
});

module.exports = router;
