const querystring = require('querystring')
const { sleep } = require('@pown/async/lib/timers')
const { Scheduler } = require('@pown/request/lib/scheduler')

const { Transformer } = require('../../transformer')

const scheduler = new Scheduler()

const pksLookupKeys = class extends Transformer {
    static get alias() {
        return ['pks_lookup_keys', 'pkslk']
    }

    static get title() {
        return 'PKS Lookup'
    }

    static get description() {
        return 'Look the the PKS database at pool.sks-keyservers.net which pgp.mit.edu is part of.'
    }

    static get types() {
        return ['domain', 'email']
    }

    static get options() {
        return {}
    }

    static get noise() {
        return 1
    }

    constructor() {
        super()

        this.headers = {
            'user-agent': 'Pown'
        }
    }

    async fetch(times, uri, ...args) {
        let res

        for (let i = 0; i < times; i++) {
            if (i > 0) {
                const delay = 5000

                this.info('Retrying', uri, 'after', delay, 'delay')

                await sleep(delay)
            } else {
                this.info('Fetching', uri)
            }

            res = await scheduler.fetch(uri, ...args)

            if (res.responseCode === 200) {
                break
            }
        }

        return res
    }

    async handle({ id: target = '', label = '' }, options) {
        const query = querystring.stringify({
            search: label,
            op: 'index'
        })

        const { responseBody } = await this.fetch(5, `http://pool.sks-keyservers.net/pks/lookup?${query}`, this.headers)

        const text = responseBody.toString().replace(/&amp;/g, '&').replace(/&lt;/g, '<').replace(/&gt;/g, '>')
        const expr = new RegExp(/<pre>((?:.|[\r\n])+?)<\/pre>/g)

        const results = []

        let match = expr.exec(text)

        while (match) {
            const inner = match[1]

            let key = ''
            let uri = ''
            let addresses = []

            const innerMatch = inner.match(/<a href="((?:.|[\r\n])+?)">((?:.|[\r\n])+?)<\/a>(?:.|[\r\n])+?<a href="((?:.|[\r\n])+?)">((?:.|[\r\n])+?)<\/a>((?:.|[\r\n])*?)$/)

            if (innerMatch) {
                uri = 'http://pool.sks-keyservers.net' + innerMatch[1].trim()
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
                const keyNode = { id: uri, type: 'pks:key', label: key, props: { uri, key }, edges: [target] }

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

                    const emailNode = { id: email, type: 'email', label: email, props: { email, name }, edges: [keyNode.id] }

                    results.push(emailNode)

                    if (name) {
                        results.push({ id: this.makeId('person', name), type: 'person', label: name, props: { name, email }, edges: [emailNode.id] })
                    }
                })
            }

            match = expr.exec(text)
        }

        return results
    }
}

module.exports = { pksLookupKeys }
