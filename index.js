'use strict'

const mqtt = require('mqtt')
const MQEmitter = require('mqemitter')
const debug = require('debug')('mqemitter-mqtt')

class MQEmitterMQTT extends MQEmitter {
  constructor(opts={}) {
    super()

    this._opts = opts
    this._upstream = mqtt.connect(opts.url, opts)
    this._subs = new Map()

    this._upstream.on('connect', () => {
      debug('connected to upstream')
    })

    this._upstream.on('message', (topic, payload) => {
      debug(`received message on ${topic} from upstream`)

      super.emit({ topic, payload })
    })

    this._upstream.on('error', err => {
      console.log(err)
    })
  }

  on(topic, notify, cb=noop) {
    debug(`subscribing to ${topic}`)

    super.on(topic, notify, (err) => {
      if (err) {
        return cb(err)
      }

      const count = this._subs.get(topic) || 0

      if (count > 0) {
        debug(`already subscribed to ${topic} on upstream`)

        this._subs.set(topic, count + 1)

        return cb()
      }

      debug(`subscribing to ${topic} on upstream`)

      this._subs.set(topic, 1)
      this._upstream.subscribe(topic, { qos: 0 }, cb)
    })

    return this
  }

  removeListener(topic, notify, cb=noop) {
    super.removeListener(topic, notify, (err) => {
      if (err) {
        return cb(err)
      }

      const count = this._subs.get(topic) || 0

      if (count < 1) {
        debug(`removeListener called but not subscribed to ${topic} on upstream`)

        return cb()
      }

      this._subs.set(topic, count - 1)

      if (count > 1) {
        debug(`staying subscribed to ${topic} on upstream`)

        return cb()
      }

      debug(`unsubscribing from ${topic} on upstream`)

      this._upstream.unsubscribe(topic, cb)
    })

    return this
  }

  emit(msg, cb=noop) {
    debug(`publishing to ${msg.topic} on upstream`)

    this._upstream.publish(msg.topic, msg.payload, {
      qos: msg.qos,
      retain: msg.retain
    }, cb)

    return this
  }

  close(cb=noop) {
    debug(`closing upstream`)

    this._upstream.end(cb)

    return this
  }
}

function noop () {}

module.exports = MQEmitterMQTT
