// statsd/index.js
// Setup some statsd stuff for qb

// vendor
var StatsD = require('node-statsd').StatsD

module.exports = function (qb, statsdconf) {
  var existing_instance = statsdconf.instance instanceof StatsD
    , statsd = existing_instance ? statsdconf.instance : createInstance(statsdconf)
    , heartbeat

  if (statsdconf.heartbeat) {
    heartbeat = setInterval(function () {
      statsd.increment('heartbeat')
    }, statsdconf.heartbeat)
  }

  // Setup some qb listeners to track progress

  qb.post('push', function (type, task, next) {
    statsd.increment(type + '.push')
    next()
  })

  qb.pre('process', function (type, task, next) {
    statsd.increment(type + '.process')
    next()
  })

  qb.on('finish', function (type, task, next) {
    statsd.increment(type + '.success')
    next()
  })

  qb.on('fail', function (type, task, next) {
    statsd.increment(type + '.failure')
    next()
  })


  qb.on('end', function () {
    clearInterval(heartbeat)
    if (!existing_instance) {
      statsd.close()
    }
  })

  qb._statsd = statsd

  return statsd
}

function createInstance(conf) {
  return new StatsD(conf.host, conf.port, (conf.prefix || 'all') + '.')
}