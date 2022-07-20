const ForbiddenError = require('../errors/ForbiddenError');
const NotFoundError = require('../errors/NotFoundError');
const Card = require('../models/card');

const getCards = (req, res, next) => {
  Card.find({})
    .then((cards) => res.send({ cards }))
    .catch(next);
};

const addCard = (req, res, next) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(201).send({ data: card }))
    .catch(next);
};

const deleteCard = async (req, res, next) => {
  try {
    const card = await Card.findById(req.params.cardId);

    if (!card) {
      throw new NotFoundError('Карточка с указанным id не найдена');
    }
    if (card.owner.toString() !== req.user._id) {
      throw new ForbiddenError('Недостаточно прав');
    }
  } catch (err) {
    next(err);
    return;
  }

  try {
    await Card.findByIdAndRemove(req.params.cardId);
    res.send({ message: 'Карточка успешно удалена' });
  } catch (err) {
    next(err);
  }
};

const likeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card) {
        res.send(card);
      } else {
        throw new NotFoundError('Карточка с указанным id не найдена');
      }
    })
    .catch(next);
};

const dislikeCard = (req, res, next) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card) {
        res.send(card);
      } else {
        throw new NotFoundError('Карточка с указанным id не найдена');
      }
    })
    .catch(next);
};

module.exports = {
  getCards,
  addCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
