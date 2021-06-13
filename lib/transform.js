const { EventEmitter } = require('events')
const { isIterable } = require('@pown/async/lib/utils')
const { eachOfLimit } = require('@pown/async/lib/eachOfLimit')
const { iterateOverEmitter } = require('@pown/async/lib/iterateOverEmitter')

class Transform extends EventEmitter {
    constructor(options) {
        super()

        const { concurrency = Infinity, ...rest } = options || {}

        this.concurrency = concurrency

        Object.assign(this, rest)
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

    async * itr(nodes, options = {}, concurrency = this.concurrency) {
        let updateProgress

        if (Array.isArray(nodes)) {
            let i = 0
            let l = nodes.length

            updateProgress = (c = 0) => this.progress((i += c), l)
        }
        else
        if (isIterable(nodes)) {
            let i = 0

            updateProgress = (c = 0) => this.progress((i += c))
        }
        else {
            throw new Error(`Non-iterable nodes detected`)
        }

        const em = new EventEmitter()

        eachOfLimit(nodes, concurrency, async(node) => {
            updateProgress()

            let results

            try {
                results = await this.handle(node, options)
            }
            catch (e) {
                this.error(e) // NOTE: report the error but do not break execution for other nodes

                updateProgress(1)

                return
            }

            if (!results) {
                return
            }

            if (!isIterable(results)) {
                results = [results]
            }

            try {
                for await (let result of results) {
                    em.emit('result', result)
                }
            }
            catch (e) {
                this.error(e) // NOTE: report the error but do not break execution for other nodes

                updateProgress(1)

                return
            }

            updateProgress(1)
        }).then(() => em.emit('end')).catch((error) => em.emit('error', error))

        yield* iterateOverEmitter(em, 'result')
    }

    async run(...args) {
        const results = []

        for await (let result of this.itr(...args)) {
            results.push(result)
        }

        return results
    }
}

module.exports = { Transform }
