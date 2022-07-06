const User = require('../models/user');

const { ERR_BAD_REQUEST, ERR_NOT_FOUND, ERR_SERVER_ERROR } = require('../utils/constants');

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(() => {
      res.status(ERR_SERVER_ERROR).send({ message: 'Что-то пошло не так' });
    });
};

const getUser = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (user) {
        res.send(user);
      } else {
        res.status(ERR_NOT_FOUND).send({ message: `Пользователь с id (${req.params.userId}) не найден` });
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        res.status(ERR_BAD_REQUEST).send({ message: 'Неверный формат id' });
      } else {
        res.status(ERR_SERVER_ERROR).send({ message: 'Что-то пошло не так' });
      }
    });
};

const addUser = (req, res) => {
  const {
    name, about, avatar, email, password,
  } = req.body;
  User.create({
    name, about, avatar, email, password,
  })
    .then((user) => res.status(201).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        res.status(ERR_BAD_REQUEST).send({ message: 'Переданы некорректные данные при создании пользователя.' });
      } else {
        res.status(ERR_SERVER_ERROR).send({ message: 'Что-то пошло не так' });
      }
    });
};

const updateProfile = (req, res) => {
  const { name, about } = req.body;
  if (name && about) {
    User.findByIdAndUpdate(
      req.user._id,
      { name, about },
      { new: true, runValidators: true },
      (err, docs) => {
        if (err) {
          if (err.name === 'ValidationError') {
            res.status(ERR_BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении профиля.' });
          } else if (err.name === 'CastError') {
            res.status(ERR_BAD_REQUEST).send({ message: 'Передан некорректный id пользователя.' });
          } else {
            res.status(ERR_SERVER_ERROR).send({ message: 'Что-то пошло не так' });
          }
        } else if (docs) {
          res.send(docs);
        } else {
          res.status(ERR_NOT_FOUND).send({ message: `Пользователь с id ${req.user._id} не найден` });
        }
      },
    );
  } else {
    res.status(ERR_BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении профиля.' });
  }
};

const updateAvatar = (req, res) => {
  const { avatar } = req.body;
  if (avatar) {
    User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true, runValidators: true },
      (err, docs) => {
        if (err) {
          if (err.name === 'ValidationError') {
            res.status(ERR_BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении аватара.' });
          } else if (err.name === 'CastError') {
            res.status(ERR_BAD_REQUEST).send({ message: 'Передан некорректный id пользователя.' });
          } else {
            res.status(ERR_SERVER_ERROR).send({ message: 'Что-то пошло не так' });
          }
        } else if (docs) {
          res.send(docs);
        } else {
          res.status(ERR_NOT_FOUND).send({ message: `Пользователь с id ${req.user._id} не найден` });
        }
      },
    );
  } else {
    res.status(ERR_BAD_REQUEST).send({ message: 'Переданы некорректные данные при обновлении аватара.' });
  }
};

module.exports = {
  getUsers,
  getUser,
  addUser,
  updateProfile,
  updateAvatar,
};
