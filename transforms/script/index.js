const path = require('path')

const { Transform } = require('../../lib//transform')

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
            script: {
                type: 'string',
                description: 'The path to the script to execute',
                default: ''
            },

            arg: {
                type: 'array',
                description: 'List of arguments to pass to the script function',
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
        const { func, args } = options

        return await func.call(this, node, ...args)
    }

    async run(nodes, options, ...rest) {
        const { script, arg: args } = options

        if (!script) {
            throw new Error(`No script to load`)
        }

        const func = require(path.resolve(process.cwd(), script))

        if (typeof(func) !== 'function') {
            throw new Error(`No function exported in ${script}`)
        }

        return super.run(nodes, { func, args }, ...rest)
    }
}

module.exports = {
    script
}
