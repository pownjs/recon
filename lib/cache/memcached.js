const Memcached = require('memcached')
const querystring = require('querystring')

class Cache {
    constructor(options) {
        const { ttl, keyPrefix, keySuffix, hosts, ...memcachedOptions } = options || {}

        this.ttl = ttl || 60

        this.keyPrefix = keyPrefix || ''
        this.keySuffix = keySuffix || ''

        this.client = new Memcached(hosts, memcachedOptions)
    }

    invoke(op, ...args) {
        return new Promise((resolve, reject) => {
            this.client[op](...args, (err, result) => {
                if (err) {
                    reject(err)
                }
                else {
                    resolve(result)
                }
            })
        })
    }

    key(transform, node, options) {
        return [this.keyPrefix, transform, node.id, this.keySuffix].filter(i => i).map(encodeURIComponent).join('/') + '?' + querystring.stringify(options || {})
    }

    async get(transform, node, options) {
        return this.invoke('get', this.key(transform, node, options))
    }

    async set(transform, node, options, value, ttl = this.ttl) {
        return this.invoke('set', this.key(transform, node, options), value, ttl)
    }

    async end() {
        return this.invoke('end')
    }
}

module.exports = { Cache }
