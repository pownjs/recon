const path = require('path')
const { EventEmitter } = require('events')
const { Worker } = require('worker_threads')
const { iterateOverEmitter } = require('@pown/async/lib/iterateOverEmitter')

const unroll = async(iterable, worker) => {
    for await (let node of iterable) {
        worker.postMessage({ type: 'stream.put', node })
    }

    worker.postMessage({ type: 'stream.end' })
}

const wrap = (Transform) => {
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
                            emitter.emit('error', error)

                            break

                        case 'end':
                            emitter.emit('end')

                            break

                        case 'info':
                            this.info(...args)

                            break

                        case 'warn':
                            this.warn(...args)

                            break

                        case 'error':
                            this.error(...args)

                            break

                        case 'debug':
                            this.debug(...args)

                            break

                        case 'progress':
                            this.progress(...args)

                            break
                    }
                })

                worker.on('error', (error) => {
                    emitter.emit('error', error)
                })

                worker.on('exit', (code) => {
                    if (code > 1) {
                        emitter.emit('error', new Error(`Worker exited with code ${code}`))
                    }

                    emitter.emit('end')
                })

                unroll(nodes, worker)

                yield* iterateOverEmitter(emitter, 'yield')

                worker.terminate()

                this.warn('finished in worker')
            }
        }
    }
    else {
        return Transform
    }
}

const wrapInWorker = (transforms) => {
    if (Array.isArray(transforms)) {
        return transforms.map(wrap)
    }
    else
    if (typeof(transforms) == 'function') {
        return wrap(transforms)
    }
    else {
        return Object.assign({}, ...Object.entries(transforms).map(([name, transform]) => {
            return {
                [name]: wrap(transform)
            }
        }))
    }
}

module.exports = { wrapInWorker }
