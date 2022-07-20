const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getCards,
  addCard,
  deleteCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

router.get('/', getCards);
router.post('/', celebrate({
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().pattern(/^https?:\/\/(www\.)?[\w\d\-_]+\.[\w]+[\w\d\-._~:/?#[\]@!$&'()*+,;=]*$/),
  }),
}), addCard);
router.delete('/:cardId', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().pattern(/^[1-9a-f]{24}$/),
  }),
}), deleteCard);
router.put('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().pattern(/^[1-9a-f]{24}$/),
  }),
}), likeCard);
router.delete('/:cardId/likes', celebrate({
  params: Joi.object().keys({
    cardId: Joi.string().pattern(/^[1-9a-f]{24}$/),
  }),
}), dislikeCard);

module.exports = router;
