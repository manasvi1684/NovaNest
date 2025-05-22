// server/index.js
const express = require('express');
const app = express();
const port = process.env.PORT || 3001;

app.get('/', (req, res) => {
  res.send('Hello from NovaNest Backend!');
});

app.listen(port, () => {
  // console.log(`NovaNest server listening on port ${port}`); // Old line
  console.log(`NovaNest server running at http://localhost:${port}/`); // New line
});