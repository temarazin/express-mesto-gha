const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getUsers,
  getUser,
  getCurrentUser,
  updateProfile,
  updateAvatar,
} = require('../controllers/users');

router.get('/', getUsers);
router.get('/me', getCurrentUser);
router.get('/:userId', celebrate({
  params: Joi.object().keys({
    userId: Joi.string().hex(),
  }),
}), getUser);
router.patch('/me', celebrate({
  body: Joi.object().keys({
    name: Joi.string().min(2).max(30),
    about: Joi.string().min(2).max(30),
  }),
}), updateProfile);
router.patch('/me/avatar', celebrate({
  body: Joi.object().keys({
    avatar: Joi.string().pattern(/^https?:\/\/(www\.)?[\w\d\-_]+\.[\w]+[\w\d\-._~:/?#[\]@!$&'()*+,;=]*$/),
  }),
}), updateAvatar);

module.exports = router;
