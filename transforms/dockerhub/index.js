const querystring = require('querystring')

const { Transform } = require('../../lib//transform')

const DOCKERHUB_REPO_TYPE = 'dockerhub:repo'

const dockerhubListRepos = class extends Transform {
    static get alias() {
        return ['dockerhub_list_repos', 'dhlr']
    }

    static get title() {
        return 'List DockerHub Repos'
    }

    static get description() {
        return 'List DockerHub repositories for a given member or org'
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
        return {
            dockerhubKey: {
                description: 'DockerHub API Key',
                type: 'string'
            },

            count: {
                description: 'Results per page',
                type: 'number',
                default: 100
            },

            pages: {
                description: 'Number of pages',
                type: 'number'
            }
        }
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 1
    }

    async handle({ id: source = '', label = '' }, options) {
        const { dockerhubKey = process.env.DOCKERHUB_KEY, count = 100, pages = Infinity } = options

        const search = querystring.escape(label)

        const results = []

        for (let page = 1; page <= pages; page++) {
            const query = querystring.stringify({
                page: page,
                per_page: count
            })

            const { results: items = [] } = await this.scheduler.tryRequest({ uri: `https://hub.docker.com/v2/repositories/${search}/?${query}`, toJson: true })

            if (!items.length) {
                break
            }

            items.forEach(({ name, namespace, description }) => {
                const fullName = `${namespace}/${name}`
                const uri = `https://hub.docker.com/r/${fullName}`

                results.push({ type: DOCKERHUB_REPO_TYPE, label: fullName, props: { uri, fullName, description }, edges: [source] })
            })
        }

        return results
    }
}

module.exports = { dockerhubListRepos }
