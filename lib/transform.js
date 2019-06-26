const { EventEmitter } = require('events')
const { eachOfLimit } = require('@pown/async/lib/eachOfLimit')

const { makeId, makeNode, flatten } = require('./utils')

class Transform extends EventEmitter {
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

    progress(...args) {
        this.emit('progress', ...args)
    }

    async handle() {
        // virtual method
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

            if (!subresults) {
                return
            }

            if (Array.isArray(subresults)) {
                results = results.concat(subresults)

                return
            }

            results.push(subresults)

            this.progress(++i, l)
        })

        return results
    }
}

module.exports = { Transform }
