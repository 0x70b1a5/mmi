const dotenv = require('dotenv').config();
const express = require('express');
const bodyParser = require('body-parser');
const request = require('request');
const moment = require('moment');
const path = require('path');

const app = express();
app.disable('x-powered-by');
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, 'client', 'build')));

app.use(function (req, res, next) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:8080');
  res.setHeader('Access-Control-Allow-Headers', 'Origin, X-Requested-With, Content-Type, Accept, Pragma, If-Modified-Since, Cache-Control');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, PATCH, DELETE, OPTIONS');
  res.setHeader('Access-Control-Allow-Credentials', 'true');
  next();
});

app.post('/data', (req, res) => {
  const valid = req.body && 
    moment(req.body.start).isValid() &&
    moment(req.body.end).isValid() &&
    req.body.data && 
    req.body.data.length > 0 &&
    (!req.body.groupBy || req.body.groupBy.length > 0);

  if (!valid) return res.status(500).json({ error: 'Invalid query.' });

  const endpoint = String(req.body.endpoint).replace(/(^\/)|(\/$)/g, '');

  request.post({
    url: `https://api-demo.machinemetrics.com/${endpoint}/`,
    headers: { 
      'Content-Type': 'application/json',
      'Authorization': process.env.MM_AUTH
    },
    json: req.body
  }, (err, http, body) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'External server error.' });
    }

    console.log('http', http, 'body', body);
    try {
      if (typeof body === 'string') return res.json(JSON.parse(body));
      res.json(body);
    } catch (e) {
      console.error(e)
      res.json({ error: 'Response was not JSON.' });
    }
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log('listening on ', PORT));
