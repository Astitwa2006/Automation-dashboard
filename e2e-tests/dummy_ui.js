const http = require('http');
const server = http.createServer((req, res) => {
  res.writeHead(500);
  res.end('Server Error');
});
server.listen(3000, () => {
  console.log('Dummy server on 3000');
});
