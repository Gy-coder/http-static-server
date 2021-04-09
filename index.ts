import * as http from 'http';
import * as fs from 'fs';
import * as p from 'path';
import * as url from 'url';

const server = http.createServer();
const publicDir = p.resolve(__dirname, 'public');

server.on(
  'request',
  (request: http.IncomingMessage, response: http.ServerResponse) => {
    const {url: path, method, headers} = request;
    const {pathname, search} = url.parse(path);
    let filename = pathname.slice(1);

    if (method !== 'GET') {
      response.statusCode = 405;
      response.end();
      return;
    }

    if (filename === '') {
      filename = 'index.html';
    }

    fs.readFile(p.resolve(publicDir, filename), (error, data) => {
      if (error) {
        if (error.errno === -2) {
          response.statusCode = 404;
          fs.readFile(p.resolve(publicDir, '404.html'), (error, data) => {
            response.end(data);
          });
        } else if (error.errno === -21) {
          response.statusCode = 403;
          response.end('You do not have permission to access the directory');
        } else {
          response.statusCode = 500;
          response.end('the server has been down');
        }
      } else {
        //   添加缓存
        response.setHeader('Cache-Control', `public,max-age=31536000`);
        response.end(data);
      }
    });
  }
);

const port = 7777;
server.listen(port, () => {
  console.log(
    `port ${port} has been listened,please open http://localhost:${port}`
  );
});
