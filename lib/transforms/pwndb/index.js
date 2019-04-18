const { Scheduler } = require('../../scheduler')
const { Transform } = require('../../transform')
const { DOMAIN_TYPE, EMAIL_TYPE } = require('../../types')

const PWNDB_ACCOUNT_TYPE = 'pwndb:account'

const scheduler = new Scheduler()

const pwndbSearch = class extends Transform {
    static get alias() {
        return ['pwndb_search', 'pds']
    }

    static get title() {
        return 'PwnDB Search'
    }

    static get description() {
        return 'Searching the PownDB database'
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

    async handle({ id: source = '', label = '' }) {
        const results = []

        const { responseBody } = await scheduler.tryRequest(5, { method: 'POST', uri: 'http://pwndb2am4tzkvold.onion.pet/', body: `luser=%25&domain=${label}&luseropr=1&domainopr=0&submitform=em` })

        const text = responseBody.toString()

        const preMatch = text.match(/<pre>([\w\W]+?)<\/pre>/)

        if (preMatch) {
            const reg = /\d[\W]?Array[\W]+?\(([\w\W]*?)\)/g

            let arrayMatch

            while ((arrayMatch = reg.exec(preMatch[1])) !== null) {
                const entry = {}

                let reg = /\[(id|luser|domain|password)\]\s=>\s(.*)/g

                let detailsMatch

                while ((detailsMatch = reg.exec(arrayMatch[1])) !== null) {
                    entry[detailsMatch[1]] = detailsMatch[2]
                }

                const { id: recordId, luser: user, domain, password } = entry

                results.push({ type: PWNDB_ACCOUNT_TYPE, label: `${recordId}@${user}@${domain}`, props: { recordId, user, domain, password }, edges: [source] })
            }
        }

        return results
    }
}

module.exports = { pwndbSearch }
