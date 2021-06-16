const assert = require('assert')

const { deserialize } = require('../../lib/worker/utils')

describe('worker/utils', () => {
    describe('#deserialize', () => {
        it('must deserialize', () => {
            const t = (i) => deserialize(i)

            assert.deepEqual(t(null), null, 'handle null')
            assert.deepEqual(t(0), 0, 'handle zero')
            assert.deepEqual(t(1), 1, 'handle number')
            assert.deepEqual(t(true), true, 'handle true')
            assert.deepEqual(t(false), false, 'handle false')
            assert.deepEqual(t('a'), 'a', 'handle string')
            assert.deepEqual(t([]), [], 'handle empty array')
            assert.deepEqual(t(['a']), ['a'], 'handle array with elements')
            assert.deepEqual(t({}), {}, 'handle empty object')
            assert.deepEqual(t({ a: 'a' }), { a: 'a' }, 'handle object with props')
            assert.deepEqual(t(Buffer.from('a')), Buffer.from('a'), 'handle buffer')
        })

        it('must handle json', () => {
            const t = (i) => deserialize(JSON.parse(JSON.stringify(i)))

            assert.deepEqual(t(null), null, 'handle null')
            assert.deepEqual(t(0), 0, 'handle zero')
            assert.deepEqual(t(1), 1, 'handle number')
            assert.deepEqual(t(true), true, 'handle true')
            assert.deepEqual(t(false), false, 'handle false')
            assert.deepEqual(t('a'), 'a', 'handle string')
            assert.deepEqual(t([]), [], 'handle empty array')
            assert.deepEqual(t(['a']), ['a'], 'handle array with elements')
            assert.deepEqual(t({}), {}, 'handle empty object')
            assert.deepEqual(t({ a: 'a' }), { a: 'a' }, 'handle object with props')
            assert.deepEqual(t(Buffer.from('a')), Buffer.from('a'), 'handle buffer')
        })
    })
})
