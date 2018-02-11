const app = require('express')();
const request = require('request');
const moment = require('moment');

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
    headers: { 'Content-Type': 'application/json' },
    json: req.body
  }, (err, http, body) => {
    if (err) {
      console.error(err);
      return res.status(500).json({ error: 'External server error.' });
    }

    try {
      res.json(JSON.parse(body));
    } catch (e) {
      console.error(e)
      res.json({ error: 'Response was not JSON.' });
    }
  });
});

const PORT = process.env.PORT || 8080;
app.listen(PORT, () => console.log('listening on ', PORT));
