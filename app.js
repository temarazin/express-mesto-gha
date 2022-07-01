const express = require('express');
const mongoose = require('mongoose');
const bodyParser = require('body-parser');
const usersRouter = require('./routes/users');
const cardsRouter = require('./routes/cards');

const app = express();

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

mongoose.connect('mongodb://localhost:27017/mestodb', {

});

app.use((req, res, next) => {
  req.user = {
    _id: '62beb0fc386cdc6e192755ea',
  };

  next();
});

app.use('/users/', usersRouter);
app.use('/cards/', cardsRouter);

app.listen(process.env.PORT || 3000);
