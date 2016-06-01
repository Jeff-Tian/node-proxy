var http = require('http');

function proxyData(options, data, request) {
    var multipartFlag = 'multipart/form-data; boundary=';
    var contentType = options.headers['Content-Type'];

    if (contentType.indexOf(multipartFlag) < 0) {
        request.write(JSON.stringify(data));
    } else {
        var boundaryKey = contentType.replace(multipartFlag, '').replace('"', '');
        request.setHeader('Content-Type', multipartFlag + '"' + boundaryKey + '"');

        for (var p in data) {
            if (data[p] instanceof Object && data[p].buffer) {
                request.write(
                    '--' + boundaryKey + '\r\n'
                    + 'Content-Disposition: form-data; name="' + p + '"; filename="' + data[p].filename + '"\r\n'
                    + 'Content-Type: ' + data[p].mimetype + '\r\n\r\n'
                );
                request.write(data[p].buffer);
            } else {
                request.write(
                    '--' + boundaryKey + '\r\n'
                    + 'Content-Disposition: form-data; name="' + p + '";' + '\r\n\r\n'
                );
                request.write(data[p]);
            }

            request.write('\r\n');
        }

        request.write('--' + boundaryKey + '--');
    }
}
function proxy(req, res, next, settings) {
    var options = {
        hostname: settings.host,
        port: settings.port || '80',
        path: settings.path || req.originalUrl,
        method: settings.method || req.method,
        headers: settings.headers || {
            'Content-Type': 'application/json;charset=UTF-8'
        }
    };

    var request = http.request(options, function (response) {
        if (settings.chunks instanceof Array) {
            settings.chunks = [];

            response.on('data', function (c) {
                settings.chunks.push(c);
            });

            response.on('end', function () {
                try {
                    settings.chunks = Buffer.concat(settings.chunks);

                    req.proxyData = settings.chunks;

                    next();
                } catch (ex) {
                    next(ex);
                }
            });

            response.on('error', function (err) {
                next(err);
            });
        } else {
            res.writeHead(response.statusCode, response.headers);
            response.pipe(res);
        }
    });

    request.on('error', function (err) {
        next(err);
    });

    if (options.method !== 'GET') {
        var data = req.body;

        if (typeof settings.dataMapper === 'function') {
            data = settings.dataMapper(data, req);
        }

        if (data) {
            proxyData(options, data, request);
        }
    }

    request.end();
}

module.exports = proxy;

