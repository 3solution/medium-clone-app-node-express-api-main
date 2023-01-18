const cors = require('cors');

const express = require('express');
const helmet = require('helmet');
const morgan = require('morgan');

require('dotenv').config();

const api = require('./api');

const middlewares = require('./middlewares');

const app = express();

app.use(cors());
app.use(express.json());
app.use(helmet());
app.use(morgan('dev'));

app.use('/api/v1', api);

app.use(middlewares.errorHandler);
app.use(middlewares.notFound);

module.exports = app;
