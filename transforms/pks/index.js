const querystring = require('querystring')

const { makeId } = require('../../lib//utils')
const { isEmail } = require('../../lib//detect')
const { Transform } = require('../../lib//transform')
const { DOMAIN_TYPE, EMAIL_TYPE } = require('../../lib//types')

const pksLookupKeys = class extends Transform {
    static get alias() {
        return ['pks_lookup_keys', 'pkslk']
    }

    static get title() {
        return 'PKS Lookup'
    }

    static get description() {
        return 'Look the the PKS database at pool.sks-keyservers.net which pgp.mit.edu is part of'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce']
    }

    static get types() {
        return [DOMAIN_TYPE, EMAIL_TYPE]
    }

    static get options() {
        return {}
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 1
    }

    async handle({ id: source = '', label = '' }, options) {
        const query = querystring.stringify({
            search: label,
            op: 'index'
        })

        const server = 'http://hkps.pool.sks-keyservers.net'

        const { responseBody } = await this.scheduler.tryRequest({ uri: `${server}/pks/lookup?${query}`, maxRetries: 5 })

        const text = responseBody.toString()
        const regx = /<pre>([\s\S]+?)<\/pre>/g

        const results = []

        let match

        while (match = regx.exec(text)) {
            let inner = match[1] || ''

            if (inner.length > 1024) {
                continue // NOTE: too big and probably junk
            }

            inner = inner.replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')

            let key = ''
            let uri = ''
            let addresses = []

            const innerMatch = inner.match(/<a href="([\s\S]+?)">([\s\S]+?)<\/a>[\s\S]+?<a href="([\s\S]+?)">([\s\S]+?)<\/a>((?:.|[\r\n])*?)$/)

            if (innerMatch) {
                uri = `${server}${innerMatch[1].trim()}`
                key = innerMatch[2].trim()

                addresses.push(innerMatch[4].trim())

                innerMatch[5].split(/\r|\n/g).forEach((line) => {
                    line = line.trim()

                    if (!line) {
                        return
                    }

                    addresses.push(line)
                })
            }

            if (key && uri) {
                if (!/^[0-9A-Z]{8}$/.test(key)) {
                    continue
                }

                const keyNode = { id: makeId('pks:key', key), type: 'pks:key', label: key, props: { uri, key }, edges: [source] }

                results.push(keyNode)

                addresses.forEach((address) => {
                    let name = ''
                    let email = ''

                    const emailMatch = address.match(/^(.*?)<(.*?)>$/)

                    if (emailMatch) {
                        const [_, _name = '', _email = ''] = emailMatch

                        name = _name.trim()
                        email = _email.trim()
                    }
                    else {
                        email = address.trim()
                    }

                    if (!isEmail(email)) {
                        return
                    }

                    const emailNode = { id: makeId('email', email), type: 'email', label: email, props: { email, name }, edges: [keyNode.id] }

                    results.push(emailNode)

                    if (name) {
                        results.push({ id: makeId('person', name), type: 'person', label: name, props: { name, email }, edges: [emailNode.id] })
                    }
                })
            }
        }

        return results
    }
}

module.exports = { pksLookupKeys }
