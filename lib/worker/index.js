const path = require('path')
const { EventEmitter } = require('events')
const { Worker } = require('worker_threads')
const { iterateOverEmitter } = require('@pown/async/lib/iterateOverEmitter')

const { deserialize } = require('./utils')

class WorkerError extends Error {
    constructor({ type, message, stack }) {
        super()

        this.type = type
        this.message = message
        this.stack = stack
    }
}

const unwrapError = (error) => {
    return new WorkerError(error)
}

const unwrapArgs = (args) => {
    return args.map((arg) => arg && arg.__isError ? unwrapError(arg) : arg)
}

const streamIterable = async(iterable, worker) => {
    for await (let node of iterable) {
        worker.postMessage({ type: 'stream.put', node })
    }

    worker.postMessage({ type: 'stream.end' })
}

const wrapInWorker = (Transform) => {
    const { loadableTransformModule, loadableTransformName } = Transform

    if (loadableTransformModule && loadableTransformModule) {
        return class extends Transform {
            async * itr(nodes, options, concurrency) {
                this.warn('starting in worker')

                const emitter = new EventEmitter()

                const worker = new Worker(path.join(__dirname, 'worker.js'))

                worker.postMessage({ type: 'run', transformModule: loadableTransformModule, transformName: loadableTransformName, transformOptions: options, transformConcurrency: concurrency })

                worker.on('message', ({ type, result, error, args }) => {
                    switch (type) {
                        case 'yield':
                            emitter.emit('yield', deserialize(result))

                            break

                        case 'error':
                            emitter.emit('error', unwrapError(error))

                            break

                        case 'end':
                            emitter.emit('end')

                            break

                        case 'transform.info':
                            this.info(...unwrapArgs(args))

                            break

                        case 'transform.warn':
                            this.warn(...unwrapArgs(args))

                            break

                        case 'transform.error':
                            this.error(...unwrapArgs(args))

                            break

                        case 'transform.debug':
                            this.debug(...unwrapArgs(args))

                            break

                        case 'transform.progress':
                            this.progress(...unwrapArgs(args))

                            break
                    }
                })

                worker.on('mesageerror', (error) => {
                    emitter.emit('error', error)
                })

                worker.on('error', (error) => {
                    emitter.emit('error', error)
                })

                worker.on('exit', (code) => {
                    if (code) {
                        emitter.emit('error', new Error(`Worker exited with code ${code}`))
                    }

                    emitter.emit('end')
                })

                streamIterable(nodes, worker)

                let error

                try {
                    yield* iterateOverEmitter(emitter, 'yield')
                }
                catch (e) {
                    error = unwrapError(e)
                }

                worker.removeAllListeners('exit')

                worker.terminate()

                this.warn('finished in worker')

                if (error) {
                    throw error
                }
            }
        }
    }
    else {
        return Transform
    }
}

module.exports = { wrapInWorker }
