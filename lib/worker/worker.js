const { EventEmitter } = require('events')
const { parentPort } = require('worker_threads')
const { iterateOverEmitter } = require('@pown/async/lib/iterateOverEmitter')

const { serialize } = require('./utils')
const { Scheduler } = require('../scheduler')

const getSafeError = (error) => {
    return { __isError: true, type: error.type, message: error.message, stack: error.stack }
}

const getSafeArgs = (args) => {
    return args.map((arg) => arg && arg instanceof Error ? getSafeError(arg) : arg)
}

console.info = (...args) => {
    parentPort.postMessage({ type: 'transform.info', args: getSafeArgs(args) })
}

console.warn = (...args) => {
    parentPort.postMessage({ type: 'transform.warn', args: getSafeArgs(args) })
}

console.error = (...args) => {
    parentPort.postMessage({ type: 'transform.error', args: getSafeArgs(args) })
}

console.debug = (...args) => {
    parentPort.postMessage({ type: 'transform.debug', args: getSafeArgs(args) })
}

const stream = new class extends EventEmitter {
    constructor() {
        super()

        this.finished = false
    }

    async put(options) {
        if (this.finished) {
            throw new Error(`Stream already finished`)
        }
        else {
            const { node } = options

            this.emit('node', node)
        }
    }

    async end() {
        if (this.finished) {
            throw new Error(`Stream already finished`)
        }
        else {
            this.finished = true
        }

        this.emit('end')
    }
}

const transform = new class {
    constructor() {
        this.running = false
    }

    info(...args) {
        parentPort.postMessage({ type: 'transform.info', args: getSafeArgs(args) })
    }

    warn(...args) {
        parentPort.postMessage({ type: 'transform.warn', args: getSafeArgs(args) })
    }

    error(...args) {
        parentPort.postMessage({ type: 'transform.error', args: getSafeArgs(args) })
    }

    debug(...args) {
        parentPort.postMessage({ type: 'transform.debug', args: getSafeArgs(args) })
    }

    progress(...args) {
        parentPort.postMessage({ type: 'transform.progress', args: getSafeArgs(args) })
    }

    async run(options) {
        if (this.running) {
            throw new Error(`Transform already running`)
        }
        else {
            this.running = true
        }

        const { transformModule, transformName, transformOptions, transformConcurrency } = options

        const module = require(transformModule)

        const Transform = transformName ? module[transformName] : module

        const transform = new Transform({ scheduler: new Scheduler() })

        transform.on('info', this.info)
        transform.on('warn', this.warn)
        transform.on('error', this.error)
        transform.on('debug', this.debug)
        transform.on('progress', this.progress)

        for await (let result of transform.itr(iterateOverEmitter(stream, 'node'), transformOptions, transformConcurrency)) {
            parentPort.postMessage({ type: 'yield', result: serialize(result) })
        }

        parentPort.postMessage({ type: 'end' })
    }
}

const onMessage = async({ type, ...options }) => {
    switch (type) {
        case 'stream.put':
            await stream.put(options)

            break

        case 'stream.end':
            await stream.end(options)

            break

        case 'run':
            await transform.run(options)

            break

        default:
            throw new Error(`Unrecognized message type ${type}`)
    }
}

parentPort.on('message', (message) => {
    onMessage(message).catch((error) => parentPort.postMessage({ type: 'error', error: getSafeError(error) }))
})
