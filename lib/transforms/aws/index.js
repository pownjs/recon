const querystring = require('querystring')
const { Scheduler } = require('@pown/request/lib/scheduler')

const { Transform } = require('../../transform')

const scheduler = new Scheduler()

const awsIamEndpoints = class extends Transform {
    static get alias() {
        return ['aws_iam_endpoints', 'awsie']
    }

    static get title() {
        return 'AWS Endpoints'
    }

    static get description() {
        return 'Enumerate AWS IAM endpoints.'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce']
    }

    static get types() {
        return ['brand']
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
        const search = querystring.escape(label)

        const results = await Promise.all([`https://${search}.signin.aws.amazon.com/console`, `https://${search}.awsapps.com/start`].map((endpoint) => {
            return scheduler.fetch(endpoint)
        }))

        return results
            .filter(({ responseCode }) => responseCode === 302)
            .map(({ uri }) => {
                return { type: 'uri', label: uri, props: { uri }, edges: [source] }
            })
    }
}

module.exports = { awsIamEndpoints }
