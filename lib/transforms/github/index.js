const querystring = require('querystring')

const { BRAND_TYPE } = require('../../types')
const { Scheduler } = require('../../scheduler')
const { Transformer } = require('../../transformer')

const GITHUB_REPO_TYPE = 'github:repo'
const GITHUB_GIST_TYPE = 'github:gist'
const GITHUB_MEMBER_TYPE = 'github:member'

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
        return 'List GitHub repositories.'
    }

    static get tags() {
        return ['ce']
    }

    static get types() {
        return [BRAND_TYPE, GITHUB_MEMBER_TYPE]
    }

    static get noise() {
        return 1
    }

    static get options() {
        return {
            count: {
                description: 'Results per page',
                type: 'number',
                default: 100
            },

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

    async handle({ id: source = '', label = '' }, options) {
        const { count = 100, type = 'owner' } = options

        const search = querystring.escape(label)

        const query = querystring.stringify({
            per_page: count,
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
            const label = fullName || Math.random().toString(32).slice(2)

            return { type: GITHUB_REPO_TYPE, label, props: { uri, fullName }, edges: [source] }
        })
    }
}

const githubListGists = class extends Transformer {
    static get alias() {
        return ['github_list_gists', 'ghlg']
    }

    static get title() {
        return 'List GitHub Gists'
    }

    static get description() {
        return 'List GitHub gists.'
    }

    static get tags() {
        return ['ce']
    }

    static get types() {
        return [BRAND_TYPE, GITHUB_MEMBER_TYPE]
    }

    static get options() {
        return {
            count: {
                description: 'Results per page',
                type: 'number',
                default: 100
            }
        }
    }

    static get noise() {
        return 1
    }

    constructor() {
        super()

        this.headers = {
            'user-agent': 'Pown'
        }
    }

    async handle({ id: source = '', label = '' }, options) {
        const { count = 100 } = options

        const search = querystring.escape(label)

        const query = querystring.stringify({
            per_page: count
        })

        const { responseBody } = await githubApiScheduler.fetch(`https://api.github.com/users/${search}/gists?${query}`, this.headers)

        const results = JSON.parse(responseBody.toString()) || []

        if (!Array.isArray(results)) {
            const { message = 'Cannot query github' } = results

            this.error(message)

            return []
        }

        return results.map(({ html_url: uri, avatar_url: avatar, description, ...rest }) => {
            const label = description || uri

            return { type: GITHUB_GIST_TYPE, label, props: { uri, description }, edges: [source] }
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

    static get tags() {
        return ['ce']
    }

    static get types() {
        return [BRAND_TYPE]
    }

    static get options() {
        return {
            count: {
                description: 'Results per page',
                type: 'number',
                default: 100
            }
        }
    }

    static get noise() {
        return 1
    }

    constructor() {
        super()

        this.headers = {
            'user-agent': 'Pown'
        }
    }

    async handle({ id: source = '', label = '' }, options) {
        const { count = 100 } = options

        const search = querystring.escape(label)

        const query = querystring.stringify({
            per_page: count
        })

        const { responseBody } = await githubApiScheduler.fetch(`https://api.github.com/orgs/${search}/members?${query}`, this.headers)

        const results = JSON.parse(responseBody.toString()) || []

        if (!Array.isArray(results)) {
            const { message = 'Cannot query github' } = results

            this.error(message)

            return []
        }

        return results.map(({ html_url: uri, login, avatar_url: avatar }) => {
            const label = login || Math.random().toString(32).slice(2)

            return { type: GITHUB_MEMBER_TYPE, label, image: avatar, props: { uri, login, avatar }, edges: [source] }
        })
    }
}

module.exports = { githubListRepos, githubListGists, githubListMembers }
