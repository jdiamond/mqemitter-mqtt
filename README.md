MQEmitter that bridges to another MQTT broker.

Specify the topic(s) to subscribe to on the remote broker and messages received
from that broker will be republished to clients on the local broker.

Messages published by clients connected to the local broker are republished to
the remote broker.

Install (don't forget to also install MQTT.js):

```
npm install mqemitter-mqtt mqtt
```

Example:

```javascript
const aedes = require('aedes');
const MQEmitterMQTT = require('mqemitter-mqtt');
const fs = require('fs');

const server = aedes({
  mq: new MQEmitterMQTT({
    // These options go to `mqtt.connect()`:
    url: 'mqtts://broker.example.org',
    ca: fs.readFileSync('ca.crt'),
    cert: fs.readFileSync('my.crt'),
    key: fs.readFileSync('my.key'),
    clientId: 'client1',
    username: 'alice',
    password: 'secret',
    clean: false,

    // These options go to 'mqtt.Client#subscribe()':
    topics: 'my/topics/#',
    qos: 1,

    // These options let you modify the topic and payload
    // sent to/received from upstream:
    transformToUpstream({ topic, payload }) {
      return { topic, payload };
    },
    transformFromUpstream({ topic, payload }) {
      return { topic, payload };
    },
  }),
});
```
