const router = require('express').Router();
const { celebrate, Joi } = require('celebrate');
const {
  getCards,
  addCard,
  deleteCard,
  likeCard,
  dislikeCard,
} = require('../controllers/cards');

const validCardFields = {
  body: Joi.object().keys({
    name: Joi.string().required().min(2).max(30),
    link: Joi.string().required().pattern(/^https?:\/\/(www\.)?[\w\d\-_]+\.[\w]+[\w\d\-._~:/?#[\]@!$&'()*+,;=]*$/),
  }),
};

const validCardId = {
  params: Joi.object().keys({
    cardId: Joi.string().hex(),
  }),
};

router.get('/', getCards);
router.post('/', celebrate(validCardFields), addCard);
router.delete('/:cardId', celebrate(validCardId), deleteCard);
router.put('/:cardId/likes', celebrate(validCardId), likeCard);
router.delete('/:cardId/likes', celebrate(validCardId), dislikeCard);

module.exports = router;
