const Card = require('../models/card');

const getCards = (req, res) => {
  Card.find({})
    .then((cards) => res.send({ cards }))
    .catch(() => {
      const ERROR_CODE = 500;
      res.status(ERROR_CODE).send({ message: 'Что-то пошло не так' });
    });
};

const addCard = (req, res) => {
  const { name, link } = req.body;
  Card.create({ name, link, owner: req.user })
    .then((card) => res.send({ data: card }))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const ERROR_CODE = 400;
        res.status(ERROR_CODE).send({ message: 'Переданы некорректные данные при создании карточки.' });
      } else {
        const ERROR_CODE = 500;
        res.status(ERROR_CODE).send({ message: 'Что-то пошло не так' });
      }
    });
};

const deleteCard = (req, res) => {
  Card.findByIdAndRemove(req.params.cardId)
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.path === '_id') {
        const ERROR_CODE = 404;
        res.status(ERROR_CODE).send({ message: `Карточка с id ${err.value} не найдена` });
      } else {
        const ERROR_CODE = 500;
        res.status(ERROR_CODE).send({ message: 'Что-то пошло не так' });
      }
    });
};

const likeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $addToSet: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const ERROR_CODE = 400;
        res.status(ERROR_CODE).send({ message: 'Переданы некорректные данные для постановки лайка.' });
      } else if (err.path === '_id') {
        const ERROR_CODE = 404;
        res.status(ERROR_CODE).send({ message: `Передан несуществующий id (${err.value}) карточки` });
      } else {
        const ERROR_CODE = 500;
        res.status(ERROR_CODE).send({ message: 'Что-то пошло не так' });
      }
    });
};

const dislikeCard = (req, res) => {
  Card.findByIdAndUpdate(
    req.params.cardId,
    { $pull: { likes: req.user._id } },
    { new: true },
  )
    .then((card) => res.send(card))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const ERROR_CODE = 400;
        res.status(ERROR_CODE).send({ message: 'Переданы некорректные данные для снятия лайка.' });
      } else if (err.path === '_id') {
        const ERROR_CODE = 404;
        res.status(ERROR_CODE).send({ message: `Передан несуществующий id (${err.value}) карточки` });
      } else {
        const ERROR_CODE = 500;
        res.status(ERROR_CODE).send({ message: 'Что-то пошло не так' });
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
