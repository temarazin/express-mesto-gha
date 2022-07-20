const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const BadRequestError = require('../errors/BadRequestError');
const NotFoundError = require('../errors/NotFoundError');

const { NODE_ENV, JWT_SECRET } = process.env;

const { ERR_BAD_REQUEST, ERR_NOT_FOUND, ERR_SERVER_ERROR } = require('../utils/constants');

const getUsers = (req, res, next) => {
  User.find({})
    .then((users) => res.send(users))
    .catch(next);
};

const getUser = (req, res, next) => {
  User.findById(req.params.userId)
    .then((user) => {
      if (user) {
        res.send(user);
      } else {
        throw new NotFoundError(`Пользователь с id (${req.params.userId}) не найден`);
      }
    })
    .catch((err) => {
      if (err.name === 'CastError') {
        const msg = 'Неверный формат id';
        next(new BadRequestError(msg));
      } else {
        next(err);
      }
    });
};

const getCurrentUser = (req, res, next) => {
  User.findById(req.user._id)
    .then((user) => {
      if (user) {
        res.send(user);
      } else {
        throw new NotFoundError(`Пользователь с id (${req.params.userId}) не найден`);
      }
    })
    .catch(next);
};

const addUser = (req, res, next) => {
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
        const msg = 'Переданы некорректные данные при создании пользователя.';
        next(new BadRequestError(msg));
      } else {
        next(err);
      }
    });
};

const updateProfile = (req, res, next) => {
  const { name, about } = req.body;
  if (name && about) {
    User.findByIdAndUpdate(
      req.user._id,
      { name, about },
      { new: true, runValidators: true },
      (err, docs) => {
        if (err) {
          if (err.name === 'ValidationError') {
            const msg = 'Переданы некорректные данные при обновлении профиля.';
            next(new BadRequestError(msg));
          } else if (err.name === 'CastError') {
            const msg = 'Передан некорректный id пользователя.';
            next(new BadRequestError(msg));
          } else {
            next(err);
          }
        } else if (docs) {
          res.send(docs);
        } else {
          const msg = `Пользователь с id ${req.user._id} не найден`;
          next(new NotFoundError(msg));
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
