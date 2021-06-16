const assert = require('assert')

const { deserialize } = require('../lib/worker/utils')

describe('utils', () => {
    it('#deserialize', () => {
        assert.deepEqual(deserialize(null), null, 'handle null')
        assert.deepEqual(deserialize(undefined), undefined, 'handle undefined')
        assert.deepEqual(deserialize(0), 0, 'handle zero')
        assert.deepEqual(deserialize(1), 1, 'handle number')
        assert.deepEqual(deserialize(true), true, 'handle true')
        assert.deepEqual(deserialize(false), false, 'handle false')
        assert.deepEqual(deserialize('a'), 'a', 'handle string')
        assert.deepEqual(deserialize([]), [], 'handle empty array')
        assert.deepEqual(deserialize(['a']), ['a'], 'handle array with elements')
        assert.deepEqual(deserialize({}), {}, 'handle empty object')
        assert.deepEqual(deserialize({ a: 'a' }), { a: 'a' }, 'handle object with props')
        assert.deepEqual(deserialize(Buffer.from('a')), Buffer.from('a'), 'handle buffer')
    })
})
