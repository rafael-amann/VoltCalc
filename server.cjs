const http = require('node:http');
const fs = require('node:fs');
const path = require('node:path');

const routes = {
  '/': ['index.html', 'text/html'],
  '/index.html': ['index.html', 'text/html'],
  '/calculator.html': ['calculator.html', 'text/html'],
  '/fundamentals.html': ['fundamentals.html', 'text/html'],
  '/styles.css': ['styles.css', 'text/css'],
  '/assets/voltcalc-mark.svg': ['assets/voltcalc-mark.svg', 'image/svg+xml'],
  '/dist/main.js': ['dist/main.js', 'text/javascript'],
  '/dist/energy.js': ['dist/energy.js', 'text/javascript'],
  '/dist/energy-form.js': ['dist/energy-form.js', 'text/javascript'],
  '/dist/calculations.js': ['dist/calculations.js', 'text/javascript'],
};

http.createServer((request, response) => {
  const pathname = new URL(request.url, 'http://localhost').pathname;
  const route = routes[pathname];
  if (!route) {
    response.writeHead(404);
    response.end('Not found');
    return;
  }
  fs.readFile(path.join(__dirname, route[0]), (error, content) => {
    if (error) {
      response.writeHead(500);
      response.end('Run npm run build before starting the server.');
      return;
    }
    response.writeHead(200, {
      'Content-Type': route[1] + '; charset=utf-8',
      'Cache-Control': 'no-store',
    });
    response.end(content);
  });
}).listen(5173, '0.0.0.0', () => {
  console.log('VoltCalc: http://localhost:5173');
});
