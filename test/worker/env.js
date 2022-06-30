const assert = require('assert')

describe('env', () => {
    it('ensure env is test', async() => {
        assert.equal(process.env.NODE_ENV, 'test', 'the env is set to test')
    })
})
