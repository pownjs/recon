const { Transformer } = require('../../transformer')

const nop = class extends Transformer {
    static get alias() {
        return []
    }

    static get title() {
        return 'No Op Transform'
    }

    static get description() {
        return 'Does not do anything.'
    }

    static get types() {
        return []
    }

    static get options() {
        return {}
    }

    static get noise() {
        return 1
    }

    async run() {
        return []
    }
}

module.exports = { nop }
