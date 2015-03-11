# qb-statsd

Adds StatsD statistics to your [qb](https://github.com/Rafflecopter/qb) instance.

## Usage

```
npm install qb-statsd --save
```

```javascript
qb.component(require('qb-statsd'), {
  instance: <instance_of_StatsD>, // if you have your own instance
  host: 'mystatsdhost.domain.tld', // if no instance, host is REQUIRED
  port: 8125, // if no instance already setup, port is REQUIRED
  prefix: 'my.prefix', // defaults to `all.`, not used if instance is passed
  heartbeat: 5000 // OPTIONAL, if set, every `heartbeat` milliseconds, a heartbeat will be registered with statsd as an increment
})

var statsdInstance = qb._statsd
```

## Statsd Stats

- Heartbeat: Set to increment every `conf.heartbeat` ms. (Not done if `conf.heartbeat` is falsy)
- For every task type, a counter of `prefix.tasktype.event` will be kept, with events of: `['push', 'process', 'success', 'failure']`

## License

MIT in LICENSE file
