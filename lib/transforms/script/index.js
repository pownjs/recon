const path = require('path')

const { Transform } = require('../../transform')

const script = class extends Transform {
    static get alias() {
        return ['script']
    }

    static get title() {
        return 'Script'
    }

    static get description() {
        return 'Perform transformation with external script'
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
            concurrency: {
                description: 'Number of concurrent scripts to run',
                type: 'number',
                default: Infinity
            },

            script: {
                type: 'string',
                description: 'The path to the script to execute.',
                default: ''
            },

            args: {
                type: 'array',
                description: 'List of arguments to pass to the function.',
                default: []
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
        const { script, args } = options

        if (!script) {
            throw new Error(`No script to load`)
        }

        const func = require(path.resolve(process.cwd(), script)) // TODO: we should not be doing our own path resolve

        if (typeof(func) !== 'function') {
            throw new Error(`No function exported in ${script}`)
        }

        return await func.call(this, node, ...args)
    }

    async run(items, { concurrency = Infinity, ...options }) {
        return await super.run(items, options, concurrency)
    }
}

module.exports = {
    script
}
