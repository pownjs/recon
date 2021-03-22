const assert = require('assert')

const transforms = require('../lib/transforms')

describe('transforms', () => {
    it('validates aliases', () => {
        const aliases = [].concat(...Object.entries(transforms).map(([name, { alias }]) => alias || []))
        const uniqueAliases = Array.from(new Set(aliases))

        assert.equal(uniqueAliases.length, aliases.length, 'Duplicate aliases')
    })

    it('validates tags', () => {
        for (let [name, value] of Object.entries(transforms)) {
            const tags = value.tags || []

            assert.ok(tags.includes('ce'), `Transform ${name} does not contain the ce tag.`)
        }
    })

    it('validates options', () => {
        const aliases = [].concat(...Object.entries(transforms).map(([name, { options }]) => Object.entries(options || {}).map(({ alias }) => alias || [])))
        const uniqueAliases = Array.from(new Set(aliases))

        assert.equal(uniqueAliases.length, aliases.length, 'Duplicate aliases')
    })
})
