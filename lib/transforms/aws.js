const querystring = require('querystring')
const { Scheduler } = require('@pown/request/lib/scheduler')

const { Transformer } = require('../transformer')

const scheduler = new Scheduler()

const awsIamEndpoints = class extends Transformer {
    static get alias() {
        return ['aws_iam_endpoints', 'awsie']
    }

    static get title() {
        return 'AWS Endpoints'
    }

    static get description() {
        return 'Enumeration AWS IAM Endpoints'
    }

    static get types() {
        return ['*']
    }

    static get options() {
        return {}
    }

    async run(items, options) {
        const results = await Promise.all(items.map(async({ id: target = '', label = '' }) => {
            const search = querystring.escape(label)

            const results = await Promise.all([`https://${search}.signin.aws.amazon.com/console`, `https://${search}.awsapps.com/start`].map((endpoint) => {
                return scheduler.fetch(endpoint)
            }))

            return results
                .filter(({ responseCode }) => responseCode === 302)
                .map(({ uri }) => {
                    return { id: uri, type: 'uri', lable: uri, props: { uri }, edges: [target] }
                })
        }))

        return this.flatten(results, 2)
    }
}

module.exports = { awsIamEndpoints }
