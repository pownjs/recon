const querystring = require('querystring')
const { Scheduler } = require('@pown/request/lib/scheduler')
const { eachOfLimit } = require('@pown/async/lib/eachOfLimit')

const { Transformer } = require('../../transformer')

const db = require('./db.json')

const scheduler = new Scheduler()

const TYPE = 'whatsmyname:account'

const whatsmynameReport = class extends Transformer {
    static get alias() {
        return ['wmnr']
    }

    static get title() {
        return 'WhatsMyName Report'
    }

    static get description() {
        return 'Find social accounts with whatsmyname database.'
    }

    static get types() {
        return ['*']
    }

    static get options() {
        return {}
    }

    constructor() {
        super()
    }

    *generateTransactions(name) {
        const { sites } = db

        for (const site of sites) {
            yield { site, method: 'GET', uri: site.check_uri.replace('{account}', name) }
        }
    }

    async run(items, options) {
        const results = await Promise.all(items.map(async({ id: target = '', label = '' }) => {
            const results = []
            
            await eachOfLimit(this.generateTransactions(label), Number.MAX_SAFE_INTEGER, async({site, ...req}) => {
                const { name, category, account_existence_code, account_existence_string } = site

                this.warn(`Checking social account at ${req.uri}`)

                const { uri, responseCode, responseBody } = await scheduler.request(req)

                const body = responseBody.toString()

                if (responseCode == account_existence_code && responseBody.indexOf(account_existence_string) >= 0) {
                    this.warn(`Account found at ${uri}`)

                    results.push({ id: this.makeId(TYPE, name, label), type: TYPE, label: `${label}@${name}`, props: { uri, category }, edges: [target] })
                }
            })

            return results
        }))

        return this.flatten(results, 2)
    }
}

module.exports = { whatsmynameReport }
