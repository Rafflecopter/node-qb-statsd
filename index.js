// statsd/index.js
// Setup some statsd stuff for qb

// vendor
var StatsD = require('node-statsd').StatsD

exports.enable = function (qb, statsdconf) {
  var statsd = statsdconf.instance instanceof StatsD ? statsdconf.instance : new StatsD(statsdconf.host, statsdconf.port, (statsdconf.prefix || 'all') + '.')


  setInterval(function () {
    statsd.increment('heartbeat')
  }, statsdconf.heartbeat)

  // Setup some qb listeners to track progress

  qb.post('push', function (type, task, next) {
    statsd.increment(type + '.push')
    next()
  })

  qb.post('process', function (type, task, next) {
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

  qb._statsd = statsd

  return statsd
}