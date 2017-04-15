'use strict';

const mqtt = require('mqtt');
const MQEmitter = require('mqemitter');
const debug = require('debug')('mqemitter-mqtt');

function noop() {}

class MQEmitterMQTT extends MQEmitter {
  constructor(opts = {}) {
    super();

    this._opts = opts;
    this._upstream = mqtt.connect(opts.url, opts);

    if (opts.topics) {
      debug(`subscribing to: ${JSON.stringify(opts.topics)}`);

      this._upstream.subscribe(
        opts.topics,
        { qos: opts.qos },
        (err, granted) => {
          if (!err) {
            debug(`granted: ${JSON.stringify(granted)}`);
          }
        }
      );
    }

    this._upstream.on('connect', () => {
      debug('connected to upstream');
    });

    this._upstream.on('message', (topic, payload) => {
      debug(`received message on ${topic} from upstream`);

      super.emit({ topic, payload });
    });

    this._upstream.on('error', err => {
      debug(err);
    });
  }

  emit(msg, cb = noop) {
    debug(`publishing to ${msg.topic}`);

    this._upstream.publish(
      msg.topic,
      msg.payload,
      {
        qos: msg.qos,
        retain: msg.retain,
      },
      cb
    );

    return this;
  }

  close(cb = noop) {
    debug('closing upstream');

    this._upstream.end(cb);

    return this;
  }
}

module.exports = MQEmitterMQTT;
