const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const { NODE_ENV, JWT_SECRET } = process.env;

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

const getCurrentUser = (req, res) => {
  User.findById(req.user._id)
    .then((user) => {
      if (user) {
        res.send(user);
      } else {
        res.status(ERR_NOT_FOUND).send({ message: `Пользователь с id (${req.params.userId}) не найден` });
      }
    })
    .catch(() => {
      res.status(ERR_SERVER_ERROR).send({ message: 'Что-то пошло не так' });
    });
};

const addUser = (req, res) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  bcrypt.hash(password, 10)
    .then((hash) => User.create({
      name, about, avatar, email, password: hash,
    }))
    .then((user) => {
      res.status(201).send(user);
    })
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

const login = (req, res) => {
  const { email, password } = req.body;
  let dbUser;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new Error('Неверные E-mail или пароль');
      }
      dbUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((matched) => {
      if (!matched) {
        throw new Error('Неверные E-mail или пароль');
      }
      const token = jwt.sign(
        { _id: dbUser._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );
      res.status(201).send({ token });
    })
    .catch((err) => res.status(401).send(err.message));
};

module.exports = {
  getUsers,
  getUser,
  getCurrentUser,
  addUser,
  updateProfile,
  updateAvatar,
  login,
};
