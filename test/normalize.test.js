const assert = require('assert')

const { normalizeDomain } = require('../lib/normalize')

describe('normalize', () => {
    it('#normalizeDomain', () => {
        assert.equal(normalizeDomain('acme.com'), 'acme.com')
        assert.equal(normalizeDomain('acme.com.'), 'acme.com')
        assert.equal(normalizeDomain('Acme.com.'), 'acme.com')
        assert.equal(normalizeDomain('*.Acme.com.'), 'acme.com')
        assert.equal(normalizeDomain('*.*.Acme.com.'), 'acme.com')
    })
})
