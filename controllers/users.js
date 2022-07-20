const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const User = require('../models/user');

const NotFoundError = require('../errors/NotFoundError');
const ConflictError = require('../errors/ConflictError');

const { NODE_ENV, JWT_SECRET } = process.env;

const { ERR_BAD_REQUEST, ERR_NOT_FOUND, MONGO_ERR_DUPLICATE_KEY } = require('../utils/constants');
const UnauthorizedError = require('../errors/UnauthorizedError');

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
    .catch(next);
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

const addUser = async (req, res, next) => {
  const {
    name, about, avatar, email, password,
  } = req.body;

  try {
    const hash = await bcrypt.hash(password, 10);
    const user = await User.create({
      name, about, avatar, email, password: hash,
    });

    res.status(201).send(
      {
        name: user.name,
        email: user.email,
        about: user.about,
        avatar: user.avatar,
        _id: user._id,
      },
    );
  } catch (err) {
    if (err.code === MONGO_ERR_DUPLICATE_KEY) {
      const msg = 'Пользователь с таким E-mail уже существует';
      next(new ConflictError(msg));
      return;
    }
    next(err);
  }
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
          next(err);
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

const updateAvatar = (req, res, next) => {
  const { avatar } = req.body;
  if (avatar) {
    User.findByIdAndUpdate(
      req.user._id,
      { avatar },
      { new: true, runValidators: true },
      (err, docs) => {
        if (err) {
          next(err);
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

const login = (req, res, next) => {
  const { email, password } = req.body;
  let dbUser;

  User.findOne({ email }).select('+password')
    .then((user) => {
      if (!user) {
        throw new UnauthorizedError('Неверные E-mail или пароль');
      }
      dbUser = user;
      return bcrypt.compare(password, user.password);
    })
    .then((matched) => {
      if (!matched) {
        throw new UnauthorizedError('Неверные E-mail или пароль');
      }
      const token = jwt.sign(
        { _id: dbUser._id },
        NODE_ENV === 'production' ? JWT_SECRET : 'dev-secret',
        { expiresIn: '7d' },
      );
      res.send({ token });
    })
    .catch(next);
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
