require('dotenv').config();

const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');
const auth = require('./middlewares/auth');
const { ERR_NOT_FOUND } = require('./utils/constants');
const { login, addUser } = require('./controllers/users');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mestodb');

app.use((req, res, next) => {
  req.user = {
    _id: '62beb0fc386cdc6e192755ea',
  };

  next();
});

app.post('/signin', login);
app.post('/signup', addUser);

app.use(auth);

app.use('/users/', usersRouter);
app.use('/cards/', cardsRouter);
app.use((req, res) => { res.status(ERR_NOT_FOUND).send({ message: 'wrong endpoint' }); });

app.listen(process.env.PORT || 3000);
