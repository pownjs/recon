const querystring = require('querystring')

const { Scheduler } = require('../../scheduler')
const { Transform } = require('../../transform')
const { DOMAIN_TYPE, EMAIL_TYPE } = require('../../types')

const SCYLLA_ACCOUNT_TYPE = 'scylla:account'

const scheduler = new Scheduler()

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

        while (true) {
            const query = querystring.stringify({
                q: `${field}:${search}`,
                size: size,
                start: start
            })

            this.info(`retrieving scylla page with size ${start}`)

            const { responseBody } = await scheduler.tryRequest({ uri: `https://scylla.so/search?${query}` })

            const items = JSON.parse(responseBody.toString())

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

                results.push({ type: SCYLLA_ACCOUNT_TYPE, label, props: { id, ...fields }, edges: [source] })
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