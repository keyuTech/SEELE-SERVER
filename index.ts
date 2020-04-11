import * as http from 'http';
import {IncomingMessage, ServerResponse} from 'http';
import * as fs from 'fs';
import * as path from 'path';
import * as url from 'url';

const server = http.createServer();
const staticDir = path.resolve(__dirname, 'static');
server.on('request', (request: IncomingMessage, response: ServerResponse) => {
    const requestUrl = request.url;
    const {method} = request;
    if (method !== 'GET') {
        response.statusCode = 405;
        response.end('不允许的方法');
    }
    const {pathname, search} = url.parse(requestUrl);
    // response.setHeader('Content-Type', 'text/html; charset=utf-8');
    let filename = pathname.substr(1);
    if (filename === '') {
        filename = 'index.html';
    }
    fs.readFile(path.resolve(staticDir, filename), (error, data) => {
        if (error) {
            console.log(error);
            if (error.errno === -2) {
                response.statusCode = 404;
                fs.readFile(path.resolve(staticDir, '404.html'), (error, data) => {
                    response.end(data);
                });
            } else if (error.errno === -21) {
                response.statusCode = 403;
                response.end('无权访问');
            } else {
                response.statusCode = 500;
                response.end('服务器繁忙');
            }
        } else {
            response.setHeader('Cache-Control', 'public, max-age=31536000');
            response.end(data);
        }
    });
});

server.listen(8888, () => {
    console.log(server.address());
});