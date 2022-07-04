const User = require('../models/user');

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(() => {
      const ERROR_CODE = 500;
      res.status(ERROR_CODE).send({ message: 'Что-то пошло не так' });
    });
};

const getUser = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (user) {
        res.send(user);
      } else {
        const ERROR_CODE = 404;
        res.status(ERROR_CODE).send({ message: `Пользователь с id (${req.params.userId}) не найден` });
      }
    })
    .catch((err) => {
      if (err.path === '_id') {
        const ERROR_CODE = 400;
        res.status(ERROR_CODE).send({ message: 'Неверный формат id' });
      } else {
        const ERROR_CODE = 500;
        res.status(ERROR_CODE).send({ message: 'Что-то пошло не так' });
      }
    });
};

const addUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => res.status(201).send(user))
    .catch((err) => {
      if (err.name === 'ValidationError') {
        const ERROR_CODE = 400;
        res.status(ERROR_CODE).send({ message: 'Переданы некорректные данные при создании пользователя.' });
      } else {
        const ERROR_CODE = 500;
        res.status(ERROR_CODE).send({ message: 'Что-то пошло не так' });
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
            const ERROR_CODE = 400;
            res.status(ERROR_CODE).send({ message: 'Переданы некорректные данные при обновлении профиля.' });
          } else if (err.name === 'CastError') {
            const ERROR_CODE = 400;
            res.status(ERROR_CODE).send({ message: 'Передан некорректный id пользователя.' });
          } else {
            const ERROR_CODE = 500;
            res.status(ERROR_CODE).send({ message: 'Что-то пошло не так' });
          }
        } else if (docs) {
          res.send(docs);
        } else {
          const ERROR_CODE = 404;
          res.status(ERROR_CODE).send({ message: `Пользователь с id ${req.user._id} не найден` });
        }
      },
    );
  } else {
    const ERROR_CODE = 400;
    res.status(ERROR_CODE).send({ message: 'Переданы некорректные данные при обновлении профиля.' });
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
            const ERROR_CODE = 400;
            res.status(ERROR_CODE).send({ message: 'Переданы некорректные данные при обновлении аватара.' });
          } else if (err.name === 'CastError') {
            const ERROR_CODE = 400;
            res.status(ERROR_CODE).send({ message: 'Передан некорректный id пользователя.' });
          } else {
            const ERROR_CODE = 500;
            res.status(ERROR_CODE).send({ message: 'Что-то пошло не так' });
          }
        } else if (docs) {
          res.send(docs);
        } else {
          const ERROR_CODE = 404;
          res.status(ERROR_CODE).send({ message: `Пользователь с id ${req.user._id} не найден` });
        }
      },
    );
  } else {
    const ERROR_CODE = 400;
    res.status(ERROR_CODE).send({ message: 'Переданы некорректные данные при обновлении аватара.' });
  }
};

module.exports = {
  getUsers,
  getUser,
  addUser,
  updateProfile,
  updateAvatar,
};
