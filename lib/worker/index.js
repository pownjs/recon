const path = require('path')
const { EventEmitter } = require('events')
const { Worker } = require('worker_threads')
const { iterateOverEmitter } = require('@pown/async/lib/iterateOverEmitter')

class WorkerError extends Error {
    constructor({ message, stack }) {
        super()

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
    if (typeof(Transform) !== 'function') {
        if (Array.isArray(Transform)) {
            return Transform.map(t => wrapInWorker(t))
        }
        else {
            return Object.assign({}, ...Object.entries(Transform).map(([name, transform]) => {
                return {
                    [name]: wrapInWorker(transform)
                }
            }))
        }
    }

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
                            emitter.emit('yield', result)

                            break

                        case 'error':
                            emitter.emit('error', unwrapError(error))

                            break

                        case 'end':
                            emitter.emit('end')

                            break

                        case 'info':
                            this.info(...unwrapArgs(args))

                            break

                        case 'warn':
                            this.warn(...unwrapArgs(args))

                            break

                        case 'error':
                            this.error(...unwrapArgs(args))

                            break

                        case 'debug':
                            this.debug(...unwrapArgs(args))

                            break

                        case 'progress':
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

                throw error
            }
        }
    }
    else {
        return Transform
    }
}

module.exports = { wrapInWorker }
