const { Scheduler } = require('@pown/request/lib/scheduler')
const { eachOfLimit } = require('@pown/async/lib/eachOfLimit')

const { Transformer } = require('../../transformer')

const WHATSMYNAME_ACCOUNT_TYPE = 'whatsmyname:account'

const db = require('./db')

const scheduler = new Scheduler()

const whatsmynameReport = class extends Transformer {
    static get alias() {
        return ['whatsmyname_report', 'whatsmyname', 'wmnr', 'wmn']
    }

    static get title() {
        return 'Whatsmyname Report'
    }

    static get description() {
        return 'Find social accounts with the help of whatsmyname database.'
    }

    static get tags() {
        return []
    }

    static get types() {
        return []
    }

    static get options() {
        return {}
    }

    static get noise() {
        return 9
    }

    constructor() {
        super()

        this.headers = {
            'User-Agent': 'Pown'
        }
    }

    accountExists(site, response) {
        const { account_existence_code, account_existence_string } = site

        const { responseCode, responseBody } = response

        const responseBodyString = responseBody.toString()

        return (responseCode == account_existence_code) && (responseBodyString.indexOf(account_existence_string) >= 0)
    }

    buildTransaction(account, site) {
        return { method: 'GET', uri: site.check_uri.replace('{account}', account), headers: { ...this.headers, ...site.check_headers }, timeout: 10000, site, account }
    }

    * generateTransactions(account) {
        const { sites } = db

        for (const site of sites) {
            const { valid } = site

            if (!valid) {
                continue
            }

            yield this.buildTransaction(account, site)
        }
    }

    async handle({ id: target = '', label = '' }, options) {
        const results = []

        await eachOfLimit(this.generateTransactions(label), Number.MAX_SAFE_INTEGER, async({ site, ...req }) => {
            const { name, category, pretty_uri } = site

            this.warn(`Checking social account at ${req.uri}`)

            const { uri, ...res } = await scheduler.request(req)

            if (this.accountExists(site, res)) {
                const prettyUri = pretty_uri ? pretty_uri.replace('{account}', label) : uri

                this.warn(`Account found at ${uri} <-> ${prettyUri}`)

                results.push({ type: WHATSMYNAME_ACCOUNT_TYPE, label: `${label}@${name}`, props: { uri, prettyUri, category }, edges: [target] })
            }
        })

        return results
    }
}

module.exports = { whatsmynameReport }
