const assert = require('assert')

const { isSubdomain } = require('../lib/detect')

describe('detect', () => {
    it('#isSubdomain', () => {
        assert.ok(!isSubdomain('acme.com'), 'acme.com is not subodmain')
        assert.ok(!!isSubdomain('sub.acme.com'), 'sub.acme.com is subodmain')
    })
})
