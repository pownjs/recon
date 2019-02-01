const querystring = require('querystring')
const { Scheduler } = require('@pown/request/lib/scheduler')

const { Transformer } = require('../../transformer')

const githubApiScheduler = new Scheduler({
    maxConcurrent: 1
})

const githubListRepos = class extends Transformer {
    static get alias() {
        return ['github_list_repos', 'ghlr']
    }

    static get title() {
        return 'List GitHub Repos'
    }

    static get description() {
        return 'List the first 100 GitHub repositories'
    }

    static get types() {
        return ['*']
    }

    static get options() {
        return {
            type: {
                description: 'Repository type',
                type: 'string',
                default: 'owner'
            }
        }
    }

    constructor() {
        super()

        this.headers = {
            'user-agent': 'Pown'
        }
    }

    async handle({ id: target = '', label = '' }, options) {
        const { type } = options

        const search = querystring.escape(label)

        const query = querystring.stringify({
            per_page: 100,
            type: type
        })

        const { responseBody } = await githubApiScheduler.fetch(`https://api.github.com/users/${search}/repos?${query}`, this.headers)

        const results = JSON.parse(responseBody.toString()) || []

        if (!Array.isArray(results)) {
            const { message = 'Cannot query github' } = results

            this.error(message)

            return []
        }

        return results.map(({ html_url: uri, full_name: fullName }) => {
            return { id: uri, type: 'github:repo', label: fullName, props: { uri, fullName }, edges: [target] }
        })
    }
}

const githubListMembers = class extends Transformer {
    static get alias() {
        return ['github_list_members', 'ghlm']
    }

    static get title() {
        return 'List GitHub Members'
    }

    static get description() {
        return 'List the first 100 GitHub members in org'
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

    async handle({ id: target = '', label = '' }, options) {
        const search = querystring.escape(label)

        const query = querystring.stringify({
            per_page: 100
        })

        const { responseBody } = await githubApiScheduler.fetch(`https://api.github.com/orgs/${search}/members?${query}`, this.headers)

        const results = JSON.parse(responseBody.toString()) || []

        if (!Array.isArray(results)) {
            const { message = 'Cannot query github' } = results

            this.error(message)

            return []
        }

        return results.map(({ html_url: uri, login, avatar_url: avatar }) => {
            return { id: uri, type: 'github:member', label: login, image: avatar, props: { uri, login, avatar }, edges: [target] }
        })
    }
}

module.exports = { githubListRepos, githubListMembers }
