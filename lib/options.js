class Options {
    constructor() {
        this.store = {}
    }

    getOption(name) {
        return this.store[name]
    }

    setOption(name, value) {
        this.store[name, value]
    }

    deleteOption(name) {
        delete this.store[name]
    }

    clearOptions() {
        this.store = {}
    }
}

module.exports = { Options }
