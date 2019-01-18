const { fetch } = require('@pown/request')
const querystring = require('querystring')

const { Transform } = require('../transform')

const dockerhubListRepos = class extends Transform {
    static get alias() {
        return ['dockerhub_list_repos', 'dhlr']
    }

    static get title() {
        return 'List DockerHub Repos'
    }

    static get description() {
        return 'List the first 100 DockerHub repositories'
    }

    static get types() {
        return ['*']
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

    async run(items, options) {
        // TODO: use a scheduler for more control over the throughput

        const results = await Promise.all(items.map(async({ id: target = '', label = '' }) => {
            const search = querystring.escape(label)

            const query = querystring.stringify({
                per_page: 100
            })

            const { responseBody } = await fetch(`https://hub.docker.com/v2/repositories/${search}/?${query}`, this.headers)

            const { results = [] } = JSON.parse(responseBody.toString())

            return results.map(({ name, namespace, description }) => {
                const fullName = `${namespace}/${name}`
                const uri = `https://hub.docker.com/r/${fullName}`

                return { id: uri, type: 'dockerhub:repo', label: fullName, props: { uri, fullName, description }, edges: [target] }
            })
        }))

        return this.flatten(results, 2)
    }
}

module.exports = { dockerhubListRepos }
