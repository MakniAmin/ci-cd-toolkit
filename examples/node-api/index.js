const express = require('express');
const app = express();

app.get('/', (req, res) => {
  res.json({ status: 'healthy', service: 'node-api' });
});

app.get('/health', (req, res) => res.sendStatus(200));

if (require.main === module) {
  app.listen(3000, () => console.log('node-api listening on 3000'));
}

module.exports = app;
