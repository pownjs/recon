const { Recon } = require('../../../lib/recon')

const recon = new Recon()

recon.on('info', console.info.bind(console))
recon.on('warn', console.warn.bind(console))
recon.on('error', console.error.bind(console))
recon.on('debug', console.debug.bind(console))

module.exports = { recon }
