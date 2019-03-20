const { EventEmitter } = require('events')
const { eachOfLimit } = require('@pown/async/lib/eachOfLimit')

const { makeId, makeNode, flatten } = require('./utils')

class Transformer extends EventEmitter {
    makeId(...args) {
        return makeId(...args)
    }

    makeNode(...args) {
        return makeNode(...args)
    }

    flatten(...args) {
        return flatten(...args)
    }

    info(...args) {
        this.emit('info', ...args)
    }

    warn(...args) {
        this.emit('warn', ...args)
    }

    error(...args) {
        this.emit('error', ...args)
    }

    async handle() {
        // virtual method
    }

    async run(items, options, concurrency = Infinity) {
        let results = []

        await eachOfLimit(items, concurrency, async(item) => {
            const subresults = await this.handle(item, options)

            if (!subresults) {
                return
            }

            if (Array.isArray(subresults)) {
                results = results.concat(subresults)

                return
            }

            results.push(subresults)
        })

        return results
    }
}

module.exports = { Transformer }
