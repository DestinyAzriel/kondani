const http = require('http');
const fs = require('fs');
const path = require('path');

const server = http.createServer((req, res) => {
  console.log(`Request received: ${req.method} ${req.url}`);
  
  if (req.url === '/' || req.url === '/index.html') {
    res.writeHead(200, { 'Content-Type': 'text/html' });
    res.end(`
      <!DOCTYPE html>
      <html>
      <head>
          <title>Test Server</title>
      </head>
      <body>
          <h1>Test Server Working</h1>
          <p>If you can see this page, the server is working correctly.</p>
          <p>Current time: ${new Date().toISOString()}</p>
      </body>
      </html>
    `);
  } else if (req.url === '/test') {
    res.writeHead(200, { 'Content-Type': 'application/json' });
    res.end(JSON.stringify({
      status: 'OK',
      message: 'Test endpoint working',
      timestamp: new Date().toISOString()
    }));
  } else {
    res.writeHead(404, { 'Content-Type': 'text/plain' });
    res.end('Not Found');
  }
});

const PORT = 5173;
server.listen(PORT, 'localhost', () => {
  console.log(`Test server running on http://localhost:${PORT}`);
  console.log(`Test endpoint available at http://localhost:${PORT}/test`);
});