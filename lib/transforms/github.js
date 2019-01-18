const { fetch } = require('@pown/request')
const querystring = require('querystring')

const { Transform } = require('../transform')

const githubListRepos = class extends Transform {
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

            const { responseBody } = await fetch(`https://api.github.com/users/${search}/repos?${query}`, this.headers)

            const results = JSON.parse(responseBody.toString()) || []

            return results.map(({ html_url: uri, full_name: fullName }) => {
                return { id: uri, type: 'github:repo', label: fullName, props: { uri, fullName }, edges: [target] }
            })
        }))

        return this.flatten(results, 2)
    }
}

const githubListMembers = class extends Transform {
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

    async run(items, options) {
        // TODO: use a scheduler for more control over the throughput

        const results = await Promise.all(items.map(async({ id: target = '', label = '' }) => {
            const search = querystring.escape(label)

            const query = querystring.stringify({
                per_page: 100
            })

            const { responseBody } = await fetch(`https://api.github.com/orgs/${search}/members?${query}`, this.headers)

            const results = JSON.parse(responseBody.toString()) || []

            return results.map(({ html_url: uri, login, avatar_url: avatar }) => {
                return { id: uri, type: 'github:user', label: login, image: avatar, props: { uri, login, avatar }, edges: [target] }
            })
        }))

        return this.flatten(results, 2)
    }
}

module.exports = { githubListRepos, githubListMembers }
