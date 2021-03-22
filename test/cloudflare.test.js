const assert = require('assert')

const { makeNode } = require('../lib/utils')
const cloudflare = require('../lib/transforms/cloudflare')

describe('cloudflare', () => {
    describe('#cloudflareDnsQuery', () => {
        const t = new cloudflare.cloudflareDnsQuery()

        it('must transform A records', async function() {
            const results = await t.run([makeNode({ type: 'string', label: 'secapps.com' })], { type: 'A' })

            assert.ok(results.length > 0, 'there are results')
            assert.ok(results.every(({ type }) => type === 'ipv4'), 'all results are of type ipv4')
        }).timeout(30000)

        it('must transform AAAA records', async function() {
            const results = await t.run([makeNode({ type: 'string', label: 'secapps.com' })], { type: 'AAAA' })

            assert.ok(results.length > 0, 'there are results')
            assert.ok(results.every(({ type }) => type === 'ipv6'), 'all results are of type ipv6')
        }).timeout(30000)

        // TODO: add more tests
    })
})
