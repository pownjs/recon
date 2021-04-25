const { EventEmitter } = require('events')
const { iterateOfLimit } = require('@pown/async/lib/iterateOfLimit')

const { isIterable } = require('./utils')
const { Scheduler } = require('./scheduler')

class Transform extends EventEmitter {
    constructor(options) {
        super()

        const { scheduler = new Scheduler(), concurrency = Infinity } = options || {}

        this.scheduler = scheduler
        this.concurrency = concurrency
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
        throw new Error(`Not implemented`) // NOTE: virtual method
    }

    async * iter(nodes, options = {}, concurrency = this.concurrency) {
        let updateProgress

        if (isIterable(nodes)) {
            updateProgress = () => {}
        }
        else {
            let i = 0
            let l = nodes.length

            updateProgress = (c = 0) => this.progress((i += c), l)
        }

        for await (let result of iterateOfLimit(nodes, concurrency, async(node) => {
            updateProgress()

            let result

            try {
                result = await this.handle(node, options)
            }
            catch (e) {
                this.error(e)

                result = null
            }

            updateProgress(1)

            if (!result) {
                return
            }

            return result
        })) {
            if (isIterable(result)) {
                yield* result
            }
            else {
                yield result
            }
        }
    }

    async run(...args) {
        const results = []

        for await (let result of this.iter(...args)) {
            results.push(result)
        }

        return results
    }
}

module.exports = { Transform }
