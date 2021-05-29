const querystring = require('querystring')

const { makeId } = require('../../lib//utils')
const { Transform } = require('../../lib//transform')
const { DOMAIN_TYPE, EMAIL_TYPE } = require('../../lib//types')

const SCYLLA_ACCOUNT_TYPE = 'scylla:account'

const scyllaSearch = class extends Transform {
    static get alias() {
        return ['scylla_search', 'scys']
    }

    static get title() {
        return 'Scylla Search'
    }

    static get description() {
        return 'Searching the Scylla database'
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

    async handle({ id: source = '', label = '', type = '' }) {
        const results = []

        let field
        let search

        if (type === DOMAIN_TYPE) {
            field = 'email'
            search = label
        }
        else
        if (type === EMAIL_TYPE) {
            field = 'email'
            search = label
        }
        else {
            field = '*'
            search = label
        }

        const size = 100

        let start = 0

        for (;;) {
            const query = querystring.stringify({
                q: `${field}:${search}`,
                size: size,
                start: start
            })

            this.info(`retrieving scylla page with size ${start}`)

            const items = await this.scheduler.tryRequest({ uri: `https://scylla.so/search?${query}`, toJson: true })

            if (!items.length) {
                break
            }

            items.forEach(({ id, fields }) => {
                const { username, domain, email } = fields

                let label

                if (email) {
                    label = email
                }
                else
                if (username && domain) {
                    label = `${username}@${domain}`
                }
                else
                if (username) {
                    label = username
                }
                else {
                    label = `${domain}/${Math.random().toString(32).slice(2)}`
                }

                const nodeId = makeId(SCYLLA_ACCOUNT_TYPE, label)

                results.push({ id: nodeId, type: SCYLLA_ACCOUNT_TYPE, label, props: { id, ...fields }, edges: [source] })

                if (type !== EMAIL_TYPE) {
                    results.push({ type: EMAIL_TYPE, label: email, props: { email }, edges: [nodeId] })
                }
            })

            if (items.length < size) {
                break
            }

            start += items.length
        }

        return results
    }
}

module.exports = { scyllaSearch }
