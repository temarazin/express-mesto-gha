const Card = require('../models/card');
const {
  ERR_BAD_REQUEST, ERR_FORBIDDEN, ERR_NOT_FOUND, ERR_SERVER_ERROR,
} = require('../utils/constants');

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ cards }))
    .catch(() => {
      res.status(ERR_SERVER_ERROR).send({ message: 'Что-то пошло не так' });
    });
};

const addCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user._id })
    .then((card) => res.status(201).send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(ERR_BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании карточки.' });
      } else {
        res.status(ERR_SERVER_ERROR).send({ message: 'Что-то пошло не так' });
      }
    });
};

const deleteCard = async (req, res) => {
  try {
    const card = await Card.findById(req.params.cardId);

    if (!card) {
      res.status(ERR_NOT_FOUND).send({ message: 'Карточка с указанным id не найдена' });
    }
    if (card.owner.toString() !== req.user._id) {
      res.send(ERR_FORBIDDEN).send({ message: 'Недостаточно прав' });
    }
  } catch (err) {
    if (err.path === '_id') {
      res.status(ERR_BAD_REQUEST).send({ message: 'Неверный формат id карточки' });
    } else {
      res.status(ERR_SERVER_ERROR).send({ message: 'Что-то пошло не так' });
    }
  }

  try {
    const card = await Card.findByIdAndRemove(req.params.cardId);
    res.send(card);
  } catch (err) {
    res.status(ERR_SERVER_ERROR).send({ message: 'Что-то пошло не так' });
  }

  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => {
      if (card) {
        res.send(card);
      } else {
        res.status(ERR_NOT_FOUND).send({ message: 'Карточка с указанным id не найдена' });
      }
    })
    .catch((err) => {
      if (err.path === '_id') {
        res.status(ERR_BAD_REQUEST).send({ message: 'Неверный формат id карточки' });
      } else {
        res.status(ERR_SERVER_ERROR).send({ message: 'Что-то пошло не так' });
      }
    });
};

const likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card) {
        res.send(card);
      } else {
        res.status(ERR_NOT_FOUND).send({ message: 'Карточка с указанным id не найдена' });
      }
    })
    .catch((err) => {
      if (err.path === '_id') {
        res.status(ERR_BAD_REQUEST).send({ message: 'Неверный формат id карточки' });
      } else {
        res.status(ERR_SERVER_ERROR).send({ message: 'Что-то пошло не так' });
      }
    });
};

const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => {
      if (card) {
        res.send(card);
      } else {
        res.status(ERR_NOT_FOUND).send({ message: 'Карточка с указанным id не найдена' });
      }
    })
    .catch((err) => {
      if (err.path === '_id') {
        res.status(ERR_BAD_REQUEST).send({ message: 'Неверный формат id карточки' });
      } else {
        res.status(ERR_SERVER_ERROR).send({ message: 'Что-то пошло не так' });
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
