# qb-statsd

Adds StatsD statistics to your qb instance.

## Usage

```
npm install qb-statsd --save
```

```javascript
var qbStatsd = require('qb-statsd')

var statsdInstance = qbStatsd.enable(qb, {
  host: 'mystatsdhost.domain.tld',
  port: 8125,
  prefix: 'my.prefix',
  heartbeat: 5000
})
```

## Statsd Stats

- Heartbeat: Set to increment every `conf.heartbeat` ms. (Not done if `conf.heartbeat` is falsy)
- For every task type, a counter of `prefix.tasktype.event` will be kept, with events of: `['push', 'process', 'success', 'failure']`

## License

MIT in LICENSE file
