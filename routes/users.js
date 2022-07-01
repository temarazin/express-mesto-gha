const router = require('express').Router();
const User = require('../models/user');

router.get('/', (req, res) => {
  User.find({})
    .then( users => res.send({users}) )
    .catch( err => res.status(500).send({message: 'Что-то пошло не так.'}));
});

router.post('/', (req, res) => {
  const { name, about, avatar } = req.body;
  User.create({ name, about, avatar })
    .then(user => res.send({ data: user }))
    .catch(err => res.status(500).send({message: 'Что-то пошло не так.'}));
});

module.exports = router;
