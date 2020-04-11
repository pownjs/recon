const { Bar } = require('@pown/cli/lib/bar')

const { Recon } = require('../../../../lib/recon')

const recon = new Recon()

recon.on('info', console.info.bind(console))
recon.on('warn', console.warn.bind(console))
recon.on('error', console.error.bind(console))
recon.on('debug', console.debug.bind(console))

// TODO: show internal-error

const bars = {}

recon.on('barStart', (name, { total = 0 }) => {
    if (total < 1000) {
        return
    }

    const bar = new Bar()

    bar.start(total, 0)

    bars[name] = bar
})

recon.on('barStep', (name, { step = 0 }) => {
    const bar = bars[name]

    if (!bar) {
        return
    }

    bar.update(step)
})

recon.on('barEnd', (name) => {
    const bar = bars[name]

    if (!bar) {
        return
    }

    bar.stop()

    delete bars[name]
})

module.exports = { recon }
