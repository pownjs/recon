const querystring = require('querystring')
const Memcached = require('memcached')

class Cache {
    constructor(server, options) {
        this.memcached = new Memcached(server, options)

        const { lifetime } = options || {}

        this.lifetime = lifetime || 60
    }

    getKey(transform, node, options) {
        return [transform, node.id].filter(i => i).map(encodeURIComponent).join('/') + '?' + querystring.stringify(options || {})
    }

    get(transform, node, options) {
        return new Promise((resolve, reject) => {
            this.memcached.get(this.getKey(transform, node, options), (err, data) => {
                if (err) {
                    reject(err)
                }
                else {
                    resolve(data)
                }
            })
        })
    }

    set(transform, node, options, result, lifetime = this.lifetime) {
        return new Promise((resolve, reject) => {
            this.memcached.set(this.getKey(transform, node, options), result, lifetime, (err) => {
                if (err) {
                    reject(err)
                }
                else {
                    resolve()
                }
            })
        })
    }

    end() {
        return new Promise((resolve, reject) => {
            this.memcached.end((err) => {
                if (err) {
                    reject(err)
                }
                else {
                    resolve()
                }
            })
        })
    }
}

module.exports = { Cache }
