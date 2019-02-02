const querystring = require('querystring')
const { Scheduler } = require('@pown/request/lib/scheduler')

const { Transformer } = require('../../transformer')

const scheduler = new Scheduler()

const awsIamEndpoints = class extends Transformer {
    static get alias() {
        return ['aws_iam_endpoints', 'awsie']
    }

    static get title() {
        return 'AWS Endpoints'
    }

    static get description() {
        return 'Enumerate AWS IAM endpoints.'
    }

    static get types() {
        return ['brand']
    }

    static get options() {
        return {}
    }

    static get noise() {
        return 1
    }

    async handle({ id: target = '', label = '' }, options) {
        const search = querystring.escape(label)

        const results = await Promise.all([`https://${search}.signin.aws.amazon.com/console`, `https://${search}.awsapps.com/start`].map((endpoint) => {
            return scheduler.fetch(endpoint)
        }))

        return results
            .filter(({ responseCode }) => responseCode === 302)
            .map(({ uri }) => {
                return { id: uri, type: 'uri', label: uri, props: { uri }, edges: [target] }
            })
    }
}

module.exports = { awsIamEndpoints }
