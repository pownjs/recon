const querystring = require('querystring')

const { BRAND_TYPE } = require('../../types')
const { Scheduler } = require('../../scheduler')
const { Transform } = require('../../transform')

const GITHUB_REPO_TYPE = 'github:repo'
const GITHUB_GIST_TYPE = 'github:gist'
const GITHUB_MEMBER_TYPE = 'github:member'

const githubApiScheduler = new Scheduler({
    maxConcurrent: 1
})

const githubListRepos = class extends Transform {
    static get alias() {
        return ['github_list_repos', 'ghlr']
    }

    static get title() {
        return 'List GitHub Repos'
    }

    static get description() {
        return 'List GitHub repositories for a given member or org.'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce']
    }

    static get types() {
        return [BRAND_TYPE, GITHUB_MEMBER_TYPE]
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 1
    }

    static get options() {
        return {
            githubKey: {
                description: 'GitHub API Key',
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
        const { githubKey=process.env.GITHUB_KEY, count = 100, pages = Infinity, type = 'owner' } = options

        const search = querystring.escape(label)

        const results = []

        for (let page = 1; page <= pages; page++) {
            const query = querystring.stringify({
                page: page,
                per_page: count,
                type: type
            })

            const { responseBody } = await githubApiScheduler.fetch(`https://api.github.com/users/${search}/repos?${query}`, this.headers)

            const items = JSON.parse(responseBody.toString()) || []

            if (!Array.isArray(items)) {
                const { message = 'Cannot query github' } = items

                this.error(message)

                break
            }

            if (!items.length) {
                break
            }

            items.forEach(({ html_url: uri, full_name: fullName }) => {
                const label = fullName || Math.random().toString(32).slice(2)

                results.push({ type: GITHUB_REPO_TYPE, label, props: { uri, fullName }, edges: [source] })
            })
        }

        return results
    }
}

const githubListGists = class extends Transform {
    static get alias() {
        return ['github_list_gists', 'ghlg']
    }

    static get title() {
        return 'List GitHub Gists'
    }

    static get description() {
        return 'List GitHub gists for a given member or org.'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce']
    }

    static get types() {
        return [BRAND_TYPE, GITHUB_MEMBER_TYPE]
    }

    static get options() {
        return {
            githubKey: {
                description: 'GitHub API Key',
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

    constructor() {
        super()

        this.headers = {
            'user-agent': 'Pown'
        }
    }

    async handle({ id: source = '', label = '' }, options) {
        const { githubKey=process.env.GITHUB_KEY, count = 100, pages = Infinity } = options

        const search = querystring.escape(label)

        const results = []

        for (let page = 1; page <= pages; page++) {
            const query = querystring.stringify({
                page: page,
                per_page: count
            })

            const { responseBody } = await githubApiScheduler.fetch(`https://api.github.com/users/${search}/gists?${query}`, this.headers)

            const items = JSON.parse(responseBody.toString()) || []

            if (!Array.isArray(items)) {
                const { message = 'Cannot query github' } = items

                this.error(message)

                break
            }

            if (!items.length) {
                break
            }

            items.forEach(({ html_url: uri, avatar_url: avatar, description, ...rest }) => {
                const label = description || uri

                results.push({ type: GITHUB_GIST_TYPE, label, props: { uri, description }, edges: [source] })
            })
        }
        
        return results
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
        return 'List GitHub members in a given org.'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce']
    }

    static get types() {
        return [BRAND_TYPE]
    }

    static get options() {
        return {
            githubKey: {
                description: 'GitHub API Key',
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

    constructor() {
        super()

        this.headers = {
            'user-agent': 'Pown'
        }
    }

    async handle({ id: source = '', label = '' }, options) {
        const { githubKey=process.env.GITHUB_KEY, count = 100, pages = Infinity } = options

        const search = querystring.escape(label)

        const results = []

        for (let page = 1; page <= pages; page++) {
            const query = querystring.stringify({
                page: page,
                per_page: count
            })

            const { responseBody } = await githubApiScheduler.fetch(`https://api.github.com/orgs/${search}/members?${query}`, this.headers)

            const items = JSON.parse(responseBody.toString()) || []

            if (!Array.isArray(items)) {
                const { message = 'Cannot query github' } = items

                this.error(message)

                break
            }

            if (!items.length) {
                break
            }

            items.forEach(({ html_url: uri, login, avatar_url: avatar }) => {
                const label = login || Math.random().toString(32).slice(2)

                results.push({ type: GITHUB_MEMBER_TYPE, label, image: avatar, props: { uri, login, avatar }, edges: [source] })
            })
        }

        return results
    }
}

module.exports = { githubListRepos, githubListGists, githubListMembers }
