const { Scout } = require('../../../scout')

const scout = new Scout()

scout.on('info', console.info.bind(console))
scout.on('warn', console.warn.bind(console))
scout.on('error', console.error.bind(console))

module.exports = { scout }
