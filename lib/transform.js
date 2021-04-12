const { EventEmitter } = require('events')
const { eachOfLimit } = require('@pown/async/lib/eachOfLimit')

const { Scheduler } = require('./scheduler')
const { makeId, makeNode } = require('./utils')

class Transform extends EventEmitter {
    constructor(options) {
        super()

        const { scheduler = new Scheduler() } = options || {}

        this.scheduler = scheduler
    }

    makeId(...args) {
        return makeId(...args)
    }

    makeNode(...args) {
        return makeNode(...args)
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

    debug(...args) {
        this.emit('debug', ...args)
    }

    progress(...args) {
        this.emit('progress', ...args)
    }

    async handle() {
        throw new Error(`Not implemented`) // virtual method
    }

    async run(items, options, concurrency = Infinity) {
        let results = []

        let i = 0
        let l = items.length

        await eachOfLimit(items, concurrency, async(item) => {
            this.progress(i, l)

            let subresults

            try {
                subresults = await this.handle(item, options)
            }
            catch (e) {
                this.error(e)

                subresults = null
            }

            this.progress(++i, l)

            if (!subresults) {
                return
            }

            if (Array.isArray(subresults)) {
                results = results.concat(subresults)
            }
            else {
                results.push(subresults)
            }
        })

        return results
    }
}

module.exports = { Transform }
