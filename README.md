```
var aedes = require('aedes')
var MQEmitterMQTT = require('mqemitter-mqtt')
var fs = require('fs')

var server = aedes({
  mq: new MQEmitterMQTT({
    url: 'mqtts://broker.example.org',
    username: 'alice',
    password: 'secret',
    ca: fs.readFileSync('ca.crt')
  })
})
```
