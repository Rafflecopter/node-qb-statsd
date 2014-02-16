// statsd/index.js
// Setup some statsd stuff for qb

// vendor
var StatsD = require('node-statsd').StatsD

exports.enable = function (qb, statsdconf) {
  var statsd = new StatsD(statsdconf.host, statsdconf.port)
    , prefix = statsdconf.prefix


  setInterval(function () {
    statsd.increment(prefix + '.heartbeat')
  }, statsdconf.heartbeat)

  // Setup some qb listeners to track progress

  qb.post('push', function (type, task, next) {
    statsd.increment([prefix, type, 'push'].join('.'))
    next()
  })

  qb.post('process', function (type, task, next) {
    statsd.increment([prefix, type, 'push'].join('.'))
    next()
  })

  qb.on('finish', function (type, task, next) {
    statsd.increment([prefix, type, 'success'].join('.'))
    next()
  })

  qb.on('fail', function (type, task, next) {
    statsd.increment([prefix, type, 'failure'].join('.'))
    next()
  })

  return statsd
}