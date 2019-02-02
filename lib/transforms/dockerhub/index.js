const querystring = require('querystring')
const { Scheduler } = require('@pown/request/lib/scheduler')

const { Transformer } = require('../../transformer')

const DOCKERHUB_REPO_TYPE = 'dockerhub:repo'

const scheduler = new Scheduler()

const dockerhubListRepos = class extends Transformer {
    static get alias() {
        return ['dockerhub_list_repos', 'dhlr']
    }

    static get title() {
        return 'List DockerHub Repos'
    }

    static get description() {
        return 'List the first 100 DockerHub repositories.'
    }

    static get types() {
        return []
    }

    static get options() {
        return {}
    }

    constructor() {
        super()

        this.headers = {
            'user-agent': 'Pown'
        }
    }

    async handle({ id: target = '', label = '' }, options) {
        const search = querystring.escape(label)

        const query = querystring.stringify({
            per_page: 100
        })

        const { responseBody } = await scheduler.fetch(`https://hub.docker.com/v2/repositories/${search}/?${query}`, this.headers)

        const { results = [] } = JSON.parse(responseBody.toString())

        return results.map(({ name, namespace, description }) => {
            const fullName = `${namespace}/${name}`
            const uri = `https://hub.docker.com/r/${fullName}`

            return { id: uri, type: DOCKERHUB_REPO_TYPE, label: fullName, props: { uri, fullName, description }, edges: [target] }
        })
    }
}

module.exports = { dockerhubListRepos }
