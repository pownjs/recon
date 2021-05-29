const { EventEmitter } = require('events')
const { parentPort } = require('worker_threads')
const { iterateOverEmitter } = require('@pown/async/lib/iterateOverEmitter')

const { Scheduler } = require('../../../../lib/scheduler')

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

    async run(options) {
        if (this.running) {
            throw new Error(`Transform already running`)
        } else {
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
