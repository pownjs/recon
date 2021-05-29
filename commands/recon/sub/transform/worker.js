const { EventEmitter } = require('events')
const { parentPort } = require('worker_threads')
const { iterateOverEmitter } = require('@pown/async/lib/iterateOverEmitter')

const { Scheduler } = require('../../../../lib/scheduler')

console.info = (...args) => {
    parentPort.postMessage({ type: 'info', args })
}

console.warn = (...args) => {
    parentPort.postMessage({ type: 'warn', args })
}

console.error = (...args) => {
    parentPort.postMessage({ type: 'error', args })
}

console.debug = (...args) => {
    parentPort.postMessage({ type: 'debug', args })
}

const stream = new class extends EventEmitter {
    constructor() {
        super()

        this.finished = false
    }

    put(options) {
        if (this.finished) {
            throw new Error(`Stream already finished`)
        }
        else {
            const { node } = options

            this.emit('node', node)
        }
    }

    end() {
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
        parentPort.postMessage({ type: 'info', args })
    }

    warn(...args) {
        parentPort.postMessage({ type: 'warn', args })
    }

    error(...args) {
        parentPort.postMessage({ type: 'error', args })
    }

    debug(...args) {
        console.log('>>>>', args)
        parentPort.postMessage({ type: 'debug', args })
    }

    progress(...args) {
        parentPort.postMessage({ type: 'progress', args })
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

        for await (let result of transform.itr(iterateOverEmitter(stream, 'node'), transformOptions, transformConcurrency)) {
            parentPort.postMessage({ type: 'yield', result })
        }

        parentPort.postMessage({ type: 'end' })
    }
}

parentPort.on('message', ({ type, ...options }) => {
    switch (type) {
        case 'stream.put':
            stream.put(options)

            break

        case 'stream.end':
            stream.end(options)

            break

        case 'run':
            transform.run(options).catch((error) => parentPort.postMessage({ type: 'error', error: { message: error.message, stack: error.stack } }))

            break

        default:
            throw new Error(`Unrecognized message type ${type}`)
    }
})
