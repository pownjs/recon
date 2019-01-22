const { EventEmitter } = require('events')

class Transformer extends EventEmitter {
    makeId(type, name) {
        return `${type ? type + ':' : ''}${name || Math.random().toString(32).substring(2)}`
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
}

module.exports = { Transformer }
