exports.yargs = {
    command: 'set [options]',
    describe: 'Set cache configuration',
    aliases: ['s'],

    builder: (yargs) => {
        yargs.options('cache-memcached-server', {
            type: 'string',
            describe: 'A memcached server address[:port]',
            default: '',
            alias: ['memcached-server']
        })

        yargs.options('cache-dynamodb-table', {
            type: 'string',
            describe: 'A dynamodb table name',
            default: '',
            alias: ['dynamodb-table']
        })

        yargs.options('cache-ttl', {
            type: 'number',
            describe: 'Cache max lifetime (seconds)',
            default: 60,
            alias: ['ttl']
        })

        yargs.options('cache-key-prefix', {
            type: 'string',
            describe: 'Prefix to add to keys',
            default: '',
            alias: ['key-prefix']
        })

        yargs.options('cache-key-suffix', {
            type: 'string',
            describe: 'Suffix to add to keys',
            default: '',
            alias: ['key-suffix']
        })
    },

    handler: (argv) => {
        const { cacheMemcachedServer, cacheDynamodbTable, cacheTtl, cacheKeyPrefix, cacheKeySuffix } = argv

        const { setCache } = require('../../../lib/globals/cache')

        let cache

        if (cacheMemcachedServer) {
            const { Cache } = require('../../../../../lib/cache/memcached')

            cache = new Cache({ hosts: [cacheMemcachedServer], ttl: cacheTtl, keyPrefix: cacheKeyPrefix, keySuffix: cacheKeySuffix })

            console.info('caching with memcached server', JSON.stringify(cacheMemcachedServer))
        }
        else
        if (cacheDynamodbTable) {
            const { Cache } = require('../../../../../lib/cache/dynamodb')

            cache = new Cache({ table: cacheDynamodbTable, ttl: cacheTtl, keyPrefix: cacheKeyPrefix, keySuffix: cacheKeySuffix })

            console.info('caching with dynamodb table', JSON.stringify(cacheDynamodbTable))
        }

        if (cache) {
            setCache(cache)
        }
    }
}
