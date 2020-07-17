const { Transform } = require('../lib/transform')

const beep = class extends Transform {
    static get alias() {
        return ['beep']
    }

    static get title() {
        return 'Beep'
    }

    static get description() {
        return 'Example loadable transform.'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce', 'offline']
    }

    static get types() {
        return []
    }

    static get options() {
        return {}
    }

    static get priority() {
        return 1000
    }

    static get noise() {
        return 1000
    }

    async run() {
        return [
            { id: 'boop', type: 'boop', label: 'boop' }
        ]
    }
}

module.exports = {
    beep
}
