let configLocal = {}
try {
  configLocal = require('./config')
} catch(e) {
  console.log('no config.js, use `cp config.sample.js config.js to create one.`')
}

let required = {
  appKey: '',
  appSecret: '',
  password: '',
  fromNumber: '',
  toNumber: ''
}

const config = Object.assign({}, required, configLocal)

if (!config.appKey || !config.appSecret || !config.fromNumber || !config.toNumber) {
  throw new Error('appKey, appSecret, fromNumber, toNumber required')
}

module.exports = config
