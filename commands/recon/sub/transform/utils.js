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

                worker.on('message', ({ type, result, error }) => {
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
                    }
                })

                worker.on('error', (error) => {
                    emitter.emit('error', error)
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
