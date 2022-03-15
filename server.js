const express = require('express');
const app = express();
const port = 3000;
const path = require('path');

app.get('/', (req, res) => {
  res.send('Hello World!');
});

// app.use(express.static(path.resolve(__dirname, './build')));
// app.get('*', (req, res) => {
//   res.sendFile(path.resolve(__dirname, './build,"index.html'));
// });

app.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});
