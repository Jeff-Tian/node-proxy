# node-service-proxy
proxy request 

# Install
```
npm install https://github.com/Jeff-Tian/node-proxy.git --save
```

# Usage
```
var proxy = require('node-service-proxy');

module.exports = require('express').Router()
    .put('/your-route', function (req, res, next) {
        proxy(req, res, next, {
            host: 'your.upstream.server',
            port: 'your-upstream-service-port',
            path: '/your/upstream/service/route',
            method: 'POST'
        });
    })
    .post('/your-another-route', function (req, res, next) {
        proxy(req, res, next, {
            host: 'your.upstream.server',
            port: 'your-upstream.port',
            path: '/your/upstream/service/route',
            method: 'POST',
            dataMapper: function(d){
                d.userId = d.member_id;
                
                return d;
            },
            continueNext: true,
            dataFieldName: 'upstreamData'
        }, function(req, res, next) {
            if(req.upstreamData.isSuccess) {
                res.send('ok');
            } else {
                res.send('not ok');
            }
        });
    })
;
```