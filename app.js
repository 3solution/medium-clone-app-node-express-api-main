const cors = require('cors');
const cron = require('node-cron');
const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');
const path = require('path');

require('dotenv').config();

const api = require('./api');
const inactiveUser = require('./crons/inactivateUser');
const middlewares = require('./middlewares');

const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));

app.use('/api/v1', api);

// add middlewares
app.use(express.static('public'));
app.use(express.static(path.join(__dirname, '../../frontend', 'build')));

app.use((req, res) => {
  res.sendFile(path.join(__dirname, '../../frontend', 'build', 'index.html'));
});

app.use(middlewares.errorHandler);
app.use(middlewares.notFound);

cron.schedule('0 0 * * *', inactiveUser);

module.exports = app;
