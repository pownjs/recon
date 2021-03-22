const assert = require('assert')

const transforms = require('../lib/transforms')

describe('transforms', () => {
    it('validates aliases', () => {
        const aliases = [].concat(...Object.entries(transforms).map(([name, { alias }]) => alias || []))
        const uniqueAliases = Array.from(new Set(aliases))

        assert.equal(uniqueAliases.length, aliases.length, 'Duplicate aliases')
    })

    it('validates options', () => {
        const aliases = [].concat(...Object.entries(transforms).map(([name, { options }]) => Object.entries(options || {}).map(({ alias }) => alias || [])))
        const uniqueAliases = Array.from(new Set(aliases))

        assert.equal(uniqueAliases.length, aliases.length, 'Duplicate aliases')
    })
})
