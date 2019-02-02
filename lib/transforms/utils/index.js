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

const echo = class extends Transformer {
    static get alias() {
        return []
    }

    static get title() {
        return 'Echo Transform'
    }

    static get description() {
        return 'Reflects nodes back.'
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

    async run(items) {
        return items.map((item) => {
            return { ...item, id: this.makeId() }
        })
    }
}

module.exports = { nop, echo }
