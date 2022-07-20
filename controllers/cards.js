const BadRequestError = require('../errors/BadRequestError');
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
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const msg = 'Переданы некорректные данные при создании карточки.';
        next(new BadRequestError(msg));
      } else {
        next(err);
      }
    });
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
    if (err.path === '_id') {
      const msg = 'Неверный формат id карточки';
      next(new BadRequestError(msg));
    } else {
      throw new Error();
    }
  }

  try {
    const card = await Card.findByIdAndRemove(req.params.cardId);
    res.send(card);
  } catch (err) {
    next(err);
  }

  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      if (card) {
        res.send(card);
      } else {
        throw new NotFoundError('Карточка с указанным id не найдена');
      }
    })
    .catch((err) => {
      if (err.path === '_id') {
        const msg = 'Неверный формат id карточки';
        next(new BadRequestError(msg));
      } else {
        next(err);
      }
    });
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
    .catch((err) => {
      if (err.path === '_id') {
        const msg = 'Неверный формат id карточки';
        next(new BadRequestError(msg));
      } else {
        next(err);
      }
    });
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
    .catch((err) => {
      if (err.path === '_id') {
        const msg = 'Неверный формат id карточки';
        next(new BadRequestError(msg));
      } else {
        next(err);
      }
    });
};

module.exports = {
  getCards,
  addCard,
  deleteCard,
  likeCard,
  dislikeCard,
};
