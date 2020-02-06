class Store {
    constructor() {
        this.store = {}
    }

    getOption(name) {
        return this.store[name]
    }

    setOption(name, value) {
        this.store[name] = value
    }

    deleteOption(name) {
        delete this.store[name]
    }

    clearOptions() {
        this.store = {}
    }

    listOptions() {
        return Object.entries(this.store).map(([name, value]) => ({ name, value }))
    }

    getOptions() {
        return {
            ...this.store
        }
    }
}

class Options {
    constructor() {
        this.stores = {}
    }

    getStore(category) {
        if (!this.stores[category]) {
            this.stores[category] = new Store()
        }

        return this.stores[category]
    }

    getOption(category, name) {
        return this.getStore(category).getOption(name)
    }

    setOption(category, name, value) {
        this.getStore(category).setOption(name, value)
    }

    deleteOption(category, name) {
        this.getStore(category).deleteOption(name)
    }

    clearOptions(category) {
        this.getStore(category).clearOptions()
    }

    listOptions(category) {
        return this.getStore(category).listOptions()
    }

    getOptions(category) {
        return this.getStore(category).getOptions()
    }
}

module.exports = { Options, Store }
