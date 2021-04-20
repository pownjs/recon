const { EventEmitter } = require('events')
const { eachOfLimit } = require('@pown/async/lib/eachOfLimit')

const { Scheduler } = require('./scheduler')
const { makeId, makeNode } = require('./utils')

class Transform extends EventEmitter {
    constructor(options) {
        super()

        const { scheduler = new Scheduler(), concurrency = Infinity } = options || {}

        this.scheduler = scheduler
        this.concurrency = concurrency
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

    async run(nodes, options, concurrency = this.concurrency) {
        let results = []

        let i = 0
        let l = nodes.length

        await eachOfLimit(nodes, concurrency, async(node) => {
            this.progress(i, l)

            let result

            try {
                result = await this.handle(node, options)
            }
            catch (e) {
                this.error(e)

                result = null
            }

            this.progress(++i, l)

            if (!result) {
                return
            }

            if (Array.isArray(result)) {
                results = results.concat(result)
            }
            else {
                results.push(result)
            }
        })

        return results
    }
}

module.exports = { Transform }
