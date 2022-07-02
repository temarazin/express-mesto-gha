const User = require('../models/user');

const getUsers = (req, res) => {
  User.find({})
    .then((users) => res.send({ users }))
    .catch((err) => res.status(500).send({ message: err.message }));
};

const getUser = (req, res) => {
  User.findById(req.params.userId)
    .then((user) => res.send({ data: user }))
    .catch((err) => res.status(500).send({ message: err.message }));
};

const addUser = (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then((user) => res.send({ data: user }))
    .catch((err) => res.status(500).send({ message: err.message }));
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
          res.status(400).send(err.name);
        } else {
          res.send(docs);
        }
      },
    );
  } else {
    res.status(400).send({ message: 'Неверные параметры' });
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
          res.status(400).send(err.name);
        } else {
          res.send(docs);
        }
      },
    );
  } else {
    res.status(400).send({ message: 'Неверные параметры' });
  }
};

module.exports = {
  getUsers,
  getUser,
  addUser,
  updateProfile,
  updateAvatar,
};
