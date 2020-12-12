const Github = require('@pown/github/lib/github')

const { Transform } = require('../../transform')
const { BRAND_TYPE, NICK_TYPE, STRING_TYPE } = require('../../types')

const GITHUB_ORG_TYPE = 'github:org'
const GITHUB_USER_TYPE = 'github:user'
const GITHUB_GIST_TYPE = 'github:gist'
const GITHUB_REPO_TYPE = 'github:repo'

const defaultOptions = {
    githubKey: {
        description: 'GitHub API Key. The key is either in the format username:password or username:token.',
        type: 'string',
        value: ''
    },

    retryRequest: {
        description: 'Re-try requests which are out of the rate limit policy.',
        type: 'boolean',
        value: true
    },

    retryRequestDelay: {
        description: 'The delay between retrying requests which are out of the rate limit policy.',
        type: 'number',
        value: 0
    },

    githubMaxResults: {
        description: 'Maximum results. Used for limiting expensive search operations.',
        type: 'number',
        value: Infinity
    }
}

const getClient = function(options) {
    const { githubKey = process.env.GITHUB_KEY, retryRequest = true, retryRequestDelay = 0 } = options

    const github = new Github({ githubKey, retryRequest, retryRequestDelay })

    github.on('info', this.emit.bind(this, 'info'))
    github.on('warn', this.emit.bind(this, 'warn'))
    github.on('error', this.emit.bind(this, 'error'))
    github.on('debug', this.emit.bind(this, 'debug'))

    return github
}

class githubUser extends Transform {
    static get alias() {
        return ['github_user', 'ghu']
    }

    static get title() {
        return 'Map GitHub User'
    }

    static get description() {
        return 'Map GitHub user for a given term.'
    }

    static get group() {
        return 'GitHub User'
    }

    static get types() {
        return [BRAND_TYPE, NICK_TYPE, STRING_TYPE]
    }

    static get options() {
        return {
            ...defaultOptions
        }
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 1
    }

    async handle({ id: source = '', label }, options) {
        const github = getClient.call(this, options)

        const results = []

        const info = await github.user(label)

        const { login, html_url: uri, avatar_url } = info

        results.push({ type: GITHUB_USER_TYPE, label: login, image: avatar_url, props: { login, uri, info }, edges: [source] })

        return results
    }
}

class githubOrg extends Transform {
    static get alias() {
        return ['github_org', 'gho']
    }

    static get title() {
        return 'Map GitHub Org'
    }

    static get description() {
        return 'Map GitHub org for a given term.'
    }

    static get group() {
        return 'GitHub Org'
    }

    static get types() {
        return [BRAND_TYPE, NICK_TYPE, STRING_TYPE]
    }

    static get options() {
        return {
            ...defaultOptions
        }
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 1
    }

    async handle({ id: source = '', label = '' }, options) {
        const github = getClient.call(this, options)

        const results = []

        const info = await github.org(label)

        const { login, html_url: uri, avatar_url } = info

        results.push({ type: GITHUB_ORG_TYPE, label: login, image: avatar_url, props: { login, uri, info }, edges: [source] })

        return results
    }
}

class githubSearchUsers extends Transform {
    static get alias() {
        return ['github_search_users', 'ghsu']
    }

    static get title() {
        return 'Search GitHub Users'
    }

    static get description() {
        return 'Search GitHub users for a given term.'
    }

    static get group() {
        return 'GitHub Users'
    }

    static get types() {
        return [BRAND_TYPE, NICK_TYPE, STRING_TYPE]
    }

    static get options() {
        return {
            ...defaultOptions,

            bioFilter: {
                description: 'Regex to filter based on bio details.',
                type: 'string',
                default: '',
                alias: ['filter-bio']
            },

            companyFilter: {
                description: 'Regex to filter based on company details.',
                type: 'string',
                default: '',
                alias: ['filter-company']
            },

            andFilter: {
                description: 'Treat all filters as if they are in and condition',
                type: 'boolean',
                default: true
            },

            orFilter: {
                description: 'Treat all filter as if they are in or condition',
                type: 'boolean',
                default: false
            }
        }
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 100
    }

    async handle({ id: source = '', label = '' }, options) {
        const github = getClient.call(this, options)

        const { bioFilter, companyFilter, andFilter, orFilter } = options

        const filters = []

        if (bioFilter) {
            const bioFilterRegex = new RegExp(bioFilter, 'i')

            filters.push(({ bio }) => bioFilterRegex.test(bio))
        }

        if (companyFilter) {
            const companyFilterRegex = new RegExp(companyFilter, 'i')

            filters.push(({ company }) => companyFilterRegex.test(company))
        }

        let filter = () => true

        if (filters.length) {
            if (orFilter) {
                filter = (args) => filters.some(f => f(args))
            }
            else
            if (andFilter) {
                filter = (args) => filters.every(f => f(args))
            }
        }

        const results = []

        for await (let { login: user, type } of github.search(label, ['users'])) {
            if (type !== 'User') {
                continue
            }

            try {
                const info = await github.user(user)

                const { login, html_url: uri, avatar_url, bio, company } = info

                if (!filter({ bio: bio || '', company: company || '' })) {
                    continue
                }

                results.push({ type: GITHUB_USER_TYPE, label: login, image: avatar_url, props: { login, uri, info }, edges: [source] })
            }
            catch (e) {
                this.error(e)
            }
        }

        return results
    }
}

class githubListOrgs extends Transform {
    static get alias() {
        return ['github_list_orgs', 'ghlo']
    }

    static get title() {
        return 'List GitHub Orgs'
    }

    static get description() {
        return 'List GitHub orgs for a given member.'
    }

    static get group() {
        return 'GitHub Orgs'
    }

    static get types() {
        return [BRAND_TYPE, GITHUB_USER_TYPE]
    }

    static get options() {
        return {
            ...defaultOptions
        }
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 1
    }

    async handle({ id: source = '', label = '', }, options) {
        const github = getClient.call(this, options)

        const results = []

        for await (let { login: org } of github.orgs(label)) {
            try {
                const info = await github.org(org)

                const { login, html_url: uri, avatar_url } = info

                results.push({ type: GITHUB_ORG_TYPE, label: login, image: avatar_url, props: { login, uri, info }, edges: [source] })
            }
            catch (e) {
                this.error(e)
            }
        }

        return results
    }
}

class githubListMembers extends Transform {
    static get alias() {
        return ['github_list_members', 'ghlm']
    }

    static get title() {
        return 'List GitHub Members'
    }

    static get description() {
        return 'List GitHub members for a given org.'
    }

    static get group() {
        return 'GitHub Members'
    }

    static get types() {
        return [BRAND_TYPE, GITHUB_ORG_TYPE]
    }

    static get options() {
        return {
            ...defaultOptions
        }
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 1
    }

    async handle({ id: source = '', label = '' }, options) {
        const github = getClient.call(this, options)

        const results = []

        for await (let { login: user } of github.members(label)) {
            try {
                const info = await github.user(user)

                const { login, html_url: uri, avatar_url } = info

                results.push({ type: GITHUB_USER_TYPE, label: login, image: avatar_url, props: { login, uri, info }, edges: [source] })
            }
            catch (e) {
                this.error(e)
            }
        }

        return results
    }
}

class githubListRepos extends Transform {
    static get alias() {
        return ['github_list_repos', 'ghlr']
    }

    static get title() {
        return 'List GitHub Repos'
    }

    static get description() {
        return 'List GitHub repos for a given user/org.'
    }

    static get group() {
        return 'GitHub Repos'
    }

    static get types() {
        return [BRAND_TYPE, GITHUB_ORG_TYPE, GITHUB_USER_TYPE]
    }

    static get options() {
        return {
            ...defaultOptions,

            forks: {
                description: 'Include forks',
                type: 'boolean',
                default: false
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
        const github = getClient.call(this, options)

        const { forks } = options

        const results = []

        for await (let info of github.repos(label)) {
            const { name, html_url: uri, description, fork } = info

            if (fork && !forks) {
                continue
            }

            results.push({ type: GITHUB_REPO_TYPE, label: name, props: { name, uri, description, info }, edges: [source] })
        }

        return results
    }
}

class githubListGists extends Transform {
    static get alias() {
        return ['github_list_gists', 'ghlg']
    }

    static get title() {
        return 'List GitHub Gists'
    }

    static get description() {
        return 'List GitHub gists for a given user/org.'
    }

    static get group() {
        return 'GitHub Gists'
    }

    static get types() {
        return [BRAND_TYPE, GITHUB_ORG_TYPE, GITHUB_USER_TYPE]
    }

    static get options() {
        return {
            ...defaultOptions
        }
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 1
    }

    async handle({ id: source = '', label = '' }, options) {
        const github = getClient.call(this, options)

        const results = []

        for await (let info of github.gists(label)) {
            const { id, html_url: uri, description } = info

            results.push({ type: GITHUB_GIST_TYPE, label: id, props: { id, uri, description, info }, edges: [source] })
        }

        return results
    }
}

module.exports = {
    githubUser,
    githubOrg,
    githubSearchUsers,
    githubListOrgs,
    githubListMembers,
    githubListRepos,
    githubListGists
}
