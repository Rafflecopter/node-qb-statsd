var dgram = require('dgram')
  , extend = require('xtend')
  , moniker = require('moniker')
  , QB = require('qb')
  , StatsD = require('node-statsd')
  , qbStatsd = require('..')
  , socket
  , qb
  , options = { host: 'localhost' }

var tests = exports.tests = {}

process.on('uncaughtException', function (err) {
  console.log('uncaught error!', err)
})

tests.setUp = function (cb) {
  options.prefix = moniker.choose()
  socket = dgram.createSocket('udp4')
  socket.bind(16000 + Math.floor(Math.random() * 1000))
  socket.on('listening', function () {
    // console.log('socket listening on ' + socket.address().address + ':' + socket.address().port)
    options.port = socket.address().port
    cb()
  })
  socket.on('error', cb)

  qb = new QB({name: options.prefix})
}

tests.tearDown = function (cb) {
  socket.close()
  qb.end()
  cb()
}

tests.nil = function (test) {
  test.expect(1)

  qb.component(qbStatsd, options)

  test.ok(qb._statsd)
  test.done()
}

tests.push = function (test) {
  test.expect(1)
  socket.on('message', onmsg)
  qb.component(qbStatsd, options)

  qb.push('foobar', {foo: 'bar'})

  function onmsg(message) {
    test.equal(message.toString('utf8'), options.prefix + '.foobar.push:1|c')
    test.done()
  }
}

tests.process_finish = function (test) {
  var first = true, msgs = {}
  test.expect(2)
  socket.on('message', onmsg)
  qb.component(qbStatsd, options)
    .can('barbaz', function (task, done) { done() })

  qb.process('barbaz', {foo: 'bar'})

  function onmsg(message) {
    msgs[message.toString('utf8')] = true
    if (first) {
      first = false
    } else {
      test.ok(msgs[options.prefix + '.barbaz.process:1|c'])
      test.ok(msgs[options.prefix + '.barbaz.success:1|c'])
      test.done()
    }
  }
}

tests.process_fail = function (test) {
  var first = true, msgs = {}
  test.expect(2)
  socket.on('message', onmsg)
  qb.component(qbStatsd, options)
    .can('barbaz', function (task, done) { done(new Error('something')) })

  qb.process('barbaz', {foo: 'bar'})

  function onmsg(message) {
    msgs[message.toString('utf8')] = true
    if (first) {
      first = false
    } else {
      test.ok(msgs[options.prefix + '.barbaz.process:1|c'], options.prefix + '.barbaz.process:1|c' + ' didn\'t get sent')
      test.ok(msgs[options.prefix + '.barbaz.failure:1|c'], options.prefix + '.barbaz.failure:1|c' + ' didn\'t get sent')
      test.done()
    }
  }
}

tests.heartbeat = function (test) {
  var opts = extend({}, options, {heartbeat: 50})
    , i = 0
    , start = new Date()

  test.expect(4)
  socket.on('message', onmsg)
  qb.component(qbStatsd, opts)

  function onmsg(message) {
    test.equal(message.toString('utf8'), options.prefix + '.heartbeat:1|c')
    if (++i == 3) {
      var length = new Date() - start
      test.ok(length >= 150 && length < 200)
      test.done()
    }
  }
}

tests.external_instance = function (test) {
  var instance = new StatsD('localhost', options.port, 'myprefix.')
    , opts = extend({}, options, {instance: instance, port: undefined, host: undefined})
    , i = 0

  test.expect(2)
  socket.on('message', onmsg)
  qb.component(qbStatsd, opts)
    .push('hello', {you: 'there'})
    .end(function () {
      instance.increment('hello.push')
    })

  function onmsg(message) {
    test.equal(message.toString('utf8'), 'myprefix.hello.push:1|c')
    if (++i == 2) {
      instance.close()
      test.done()
    }
  }
}