const assert = require('assert')

const { makeStringNode } = require('./helpers')
const cloudflare = require('../lib/transforms/cloudflare')

describe('cloudflare', () => {
    describe('#cloudflareDnsQuery', () => {
        const t = new cloudflare.cloudflareDnsQuery()

        it('must transform A records', async function() {
            const results = await t.run([makeStringNode('secapps.com')], { type: 'A' })

            assert.ok(results.length > 0, 'there are results')
            assert.ok(results.every(({ type }) => type === 'ipv4'), 'all results are of type ipv4')
        })

        it('must transform AAAA records', async function() {
            const results = await t.run([makeStringNode('secapps.com')], { type: 'AAAA' })

            assert.ok(results.length > 0, 'there are results')
            assert.ok(results.every(({ type }) => type === 'ipv6'), 'all results are of type ipv6')
        })

        // TODO: add more tests
    })
})
