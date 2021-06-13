const path = require('path')
const { Worker } = require('worker_threads')

const { Transform } = require('../../lib//transform')

const worker = class extends Transform {
    static get alias() {
        return ['worker']
    }

    static get title() {
        return 'Worker'
    }

    static get description() {
        return 'Perform transformation with external worker'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce', 'evil', 'local']
    }

    static get types() {
        return []
    }

    static get options() {
        return {
            worker: {
                type: 'string',
                description: 'The path to the worker to execute',
                default: ''
            },

            arg: {
                type: 'array',
                description: 'List of arguments to pass to the worker function',
                default: []
            },

            perNode: {
                type: 'boolean',
                description: 'Run new worker per node',
                default: false
            }
        }
    }

    static get priority() {
        return 100
    }

    static get noise() {
        return 100
    }

    async handle(node, options) {
        if (options.perNode) {
            const { worker: script, arg: args } = options

            if (!script) {
                throw new Error(`No worker to load`)
            }

            const results = []

            const workerPath = path.resolve(process.cwd(), script)

            const worker = new Worker(workerPath, {
                workerData: { args }
            })

            worker.on('message', (result) => {
                results.push(result)
            })

            worker.postMessage(node)

            await new Promise((resolve, reject) => {
                worker.once('exit', (code) => {
                    if (code === 0) {
                        resolve()
                    }
                    else {
                        reject(new Error(`Worker stopped with exit code ${code}`))
                    }
                })

                worker.once('error', reject)
            })

            return results
        }
        else {
            const { worker } = options

            worker.postMessage(node)

            return new Promise((resolve, reject) => {
                worker.once('message', resolve)

                worker.once('error', reject)
            })
        }
    }

    async run(nodes, options, ...rest) {
        if (options.perNode) {
            return super.run(nodes, options, ...rest)
        }
        else {
            const { worker: script, arg: args } = options

            if (!script) {
                throw new Error(`No worker to load`)
            }

            const workerPath = path.resolve(process.cwd(), script)

            const worker = new Worker(workerPath, {
                workerData: { args }
            })

            const workerPromise = new Promise((resolve, reject) => {
                worker.once('exit', (code) => {
                    if (code === 0) {
                        resolve()
                    }
                    else {
                        reject(new Error(`Worker stopped with exit code ${code}`))
                    }
                })
            })

            const runnerPromise = super.run(nodes, { worker }, ...rest)

            await Promise.race([workerPromise, runnerPromise])

            worker.terminate()

            return runnerPromise
        }
    }
}

module.exports = {
    worker
}
