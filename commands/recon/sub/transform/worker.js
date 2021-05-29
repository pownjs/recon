const { EventEmitter } = require('events')
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

        const { node } = options

        this.emit('node', node)
    }

    end() {
        if (this.finished) {
            throw new Error(`Stream already finished`)
        }

        this.emit('end')

        this.finished = true
    }
}

const run = async(options) => {
    const { transformModule, transformName, transformOptions, transformConcurrency } = options

    const module = require(transformModule)

    const Transform = transformName ? module[transformName] : module

    const transform = new Transform({ scheduler: new Scheduler() })

    for await (let result of transform.itr(iterateOverEmitter(stream, 'node'), transformOptions, transformConcurrency)) {
        self.postMessage({ type: 'yield', result })
    }

    self.postMessage({ type: 'end' })
}

addEventListener('message', ({ type, ...options }) => {
    switch (type) {
        case 'stream.put':
            stream.put(options)

            break

        case 'stream.end':
            stream.end(options)

            break

        case 'run':
            run(options)

            break

        default:
            throw new Error(`Unrecognized message type ${type}`)
    }
})
