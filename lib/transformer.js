const { EventEmitter } = require('events')

const { makeId } = require('./utils')

class Transformer extends EventEmitter {
    makeId(...args) {
        return makeId(...args)
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

    flatten(array, times) {
        let result = array

        for (let i = 0; i < times; i++) {
            result = [].concat(...result)
        }

        return result
    }

    async handle() {}

    async run(items, options) {
        const results = await Promise.all(items.map(async(item) => {
            return this.handle(item, options)
        }))

        return this.flatten(results, 2)
    }
}

module.exports = { Transformer }
