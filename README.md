# node-proxy
proxy request 

# Install
```
npm install https://github.com/Jeff-Tian/node-proxy.git --save
```

# Usage
```
var proxy = require('proxy');

module.exports = require('express').Router()
    .put('/your-route', function (req, res, next) {
        proxy(req, res, next, {
            host: 'your.upstream.server',
            port: 'your-upstream-service-port',
            path: '/your/upstream/service/route',
            method: 'POST'
        });
    })
;
```