const awsSdk = require('aws-sdk')
const querystring = require('querystring')

class Cache {
    constructor(options) {
        const { ttl, ttlKeyName, keyPrefix, keySuffix, keyName, table, ...documentClientOptions } = options || {}

        this.ttl = ttl || 60
        this.ttlKeyName = ttlKeyName || 'ttl'

        this.keyPrefix = keyPrefix || ''
        this.keySuffix = keySuffix || ''
        this.keyName = keyName || 'key'

        this.table = table

        this.client = new awsSdk.DynamoDB.DocumentClient(documentClientOptions)
    }

    key(transform, node, options) {
        return [this.keyPrefix, transform, node.id, this.keySuffix].filter(i => i).map(encodeURIComponent).join('/') + '?' + querystring.stringify(options || {})
    }

    async get(transform, node, options) {
        const { Item: item } = await this.client.get({
            TableName: this.table,
            Key: {
                [this.keyName]: this.key(transform, node, options)
            }
        }).promise()

        if (item) {
            if (item.ttl >= Date.now() / 1000) {
                return item.value
            }
        }
    }

    async set(transform, node, options, value, ttl = this.ttl) {
        await this.client.put({
            TableName: this.table,
            Item: {
                [this.keyName]: this.key(transform, node, options),
                [this.ttlKeyName]: Math.round((Date.now() / 1000) + ttl),

                value: value
            }
        }).promise()
    }

    async end() {}
}

module.exports = { Cache }
