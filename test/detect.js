const assert = require('assert')

const { isSubdomain, isSubdomainOf } = require('../lib/detect')

describe('detect', () => {
    it('#isSubdomain', () => {
        assert.ok(!isSubdomain('acme.com'), 'acme.com is not subodmain')
        assert.ok(!!isSubdomain('sub.acme.com'), 'sub.acme.com is subodmain')
    })

    it('#isSubdomainOf', () => {
        assert.ok(!isSubdomainOf('acme.com', 'acme.com', 'acme.com is not subdomain of acme.com'))
        assert.ok(!!isSubdomainOf('sub.acme.com', 'acme.com', 'sub.acme.com is subdomain of acme.com'))
        assert.ok(!isSubdomainOf('sub.test.com', 'acme.com', 'sub.test.com is not subdomain of acme.com'))
    })
})
