const assert = require('assert')

const { Recon } = require('../lib/recon')
const { makeNode } = require('../lib/utils')

describe('recon', () => {
    describe('#addNodes', () => {
        it('must add node', async function() {
            const r = new Recon()

            await r.addNodes([makeNode({ type: 'string', label: 'test' })])

            r.select('*')

            assert.ok(r.selection.length === 1)
            assert.ok(r.selection[0].data('props').string === undefined)
        })

        it('must update node if node exists', async function() {
            const r = new Recon()

            await r.addNodes([makeNode({ type: 'string', label: 'test' })])

            r.select('*')

            assert.ok(r.selection.length === 1)
            assert.ok(r.selection[0].data('props').string === undefined)

            await r.addNodes([makeNode({ type: 'string', label: 'test', props: { string: 'test' } })])

            r.select('*')

            assert.ok(r.selection.length === 1)
            assert.ok(r.selection[0].data('props').string === 'test')
        })

        it('must preserve buffers in data structs', async function() {
            const r = new Recon()

            const buffer = Buffer.from('buffer')

            await r.addNodes([makeNode({ type: 'buffer', label: 'buffer', props: { buffer } })])

            r.select('*')

            assert.ok(r.selection.length === 1)
            assert.ok(r.selection[0].data('props').buffer === buffer)

            const d = await r.serialize()

            assert.ok(d.elements.nodes.length === 1)
            assert.ok(d.elements.nodes[0].data.props.buffer === buffer)
        })
    })
})
