const Github = require('@pown/github/lib/github')

const { Transform } = require('../../transform')
const { BRAND_TYPE, NICK_TYPE, STRING_TYPE } = require('../../types')

const GITHUB_ORG_TYPE = 'github:org'
const GITHUB_USER_TYPE = 'github:user'
const GITHUB_GIST_TYPE = 'github:gist'
const GITHUB_REPO_TYPE = 'github:repo'

const defineTransform = (def) => {
    return class extends Transform {
        static get alias() {
            return def.alias
        }

        static get title() {
            return def.title
        }

        static get description() {
            return def.description
        }

        static get group() {
            return def.title || this.title
        }

        static get tags() {
            return ['ce']
        }

        static get types() {
            return def.types
        }

        static get priority() {
            return def.priority
        }

        static get noise() {
            return def.noise
        }

        static get options() {
            return {
                ...def.options,

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
        }

        async handle({ id: source = '', label = '' }, options) {
            const { githubKey = process.env.GITHUB_KEY, retryRequest = true, retryRequestDelay = 0 } = options

            const github = new Github({ githubKey, retryRequest, retryRequestDelay })

            github.on('info', this.emit.bind(this, 'info'))
            github.on('warn', this.emit.bind(this, 'warn'))
            github.on('error', this.emit.bind(this, 'error'))
            github.on('debug', this.emit.bind(this, 'debug'))

            return def.transform({ source, label, github }, options)
        }
    }
}

const githubUser = defineTransform({
    category: ['github'],

    alias: ['github_user', 'ghu'],

    title: 'Map GitHub User',

    description: 'Map GitHub user for a given term.',

    group: 'GitHub User',

    types: [BRAND_TYPE, NICK_TYPE, STRING_TYPE],

    options: {},

    priority: 1,

    noise: 1,

    transform: async({ source, label, github }, options) => {
        const results = []

        info = await github.user(label)

        const { login, html_url: uri, avatar_url } = info

        results.push({ type: GITHUB_USER_TYPE, label: login, image: avatar_url, props: { login, uri, info }, edges: [source] })

        return results
    }
})

const githubOrg = defineTransform({
    category: ['github'],

    alias: ['github_org', 'gho'],

    title: 'Map GitHub Org',

    description: 'Map GitHub org for a given term.',

    group: 'GitHub Org',

    types: [BRAND_TYPE, NICK_TYPE, STRING_TYPE],

    options: {},

    priority: 1,

    noise: 1,

    transform: async({ source, label, github }, options) => {
        const results = []

        info = await github.org(label)

        const { login, html_url: uri, avatar_url } = info

        results.push({ type: GITHUB_ORG_TYPE, label: login, image: avatar_url, props: { login, uri, info }, edges: [source] })

        return results
    }
})

const githubSearchUsers = defineTransform({
    category: ['github'],

    alias: ['github_search_users', 'ghsu'],

    title: 'Search GitHub Users',

    description: 'Search GitHub users for a given term.',

    group: 'GitHub Users',

    types: [BRAND_TYPE, NICK_TYPE, STRING_TYPE],

    options: {
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
        }
    },

    priority: 1,

    noise: 100,

    transform: async({ source, label, github }, options) => {
        const { bioFilter, companyFilter } = options

        let bioFilterRegex
        let companyFilterRegex

        if (bioFilter) {
            bioFilterRegex = new RegExp(bioFilter, 'i')
        }

        if (companyFilter) {
            companyFilterRegex = new RegExp(companyFilter, 'i')
        }

        const results = []

        for await (let { login: user } of github.search(label, ['users'])) {
            info = await github.user(user)

            const { login, html_url: uri, avatar_url, bio, company } = info

            if (bioFilterRegex || companyFilterRegex) {
                if (!bioFilterRegex.test(bio || '') && !companyFilterRegex.test(company || '')) {
                    continue
                }
            }

            results.push({ type: GITHUB_USER_TYPE, label: login, image: avatar_url, props: { login, uri, info }, edges: [source] })
        }

        return results
    }
})

const githubListOrgs = defineTransform({
    category: ['github'],

    alias: ['github_list_orgs', 'ghlo'],

    title: 'List GitHub Orgs',

    description: 'List GitHub orgs for a given member.',

    group: 'GitHub Orgs',

    types: [BRAND_TYPE, GITHUB_USER_TYPE],

    options: {},

    priority: 1,

    noise: 1,

    transform: async({ source, label, github }) => {
        const results = []

        for await (let { login: org } of github.orgs(label)) {
            info = await github.org(org)

            const { login, html_url: uri, avatar_url } = info

            results.push({ type: GITHUB_ORG_TYPE, label: login, image: avatar_url, props: { login, uri, info }, edges: [source] })
        }

        return results
    }
})

const githubListMembers = defineTransform({
    category: ['github'],

    alias: ['github_list_members', 'ghlm'],

    title: 'List GitHub Members',

    description: 'List GitHub members for a given org.',

    group: 'GitHub Members',

    types: [BRAND_TYPE, GITHUB_ORG_TYPE],

    options: {},

    priority: 1,

    noise: 1,

    transform: async({ source, label, github }) => {
        const results = []

        for await (let { login: user } of github.members(label)) {
            info = await github.user(user)

            const { login, html_url: uri, avatar_url } = info

            results.push({ type: GITHUB_USER_TYPE, label: login, image: avatar_url, props: { login, uri, info }, edges: [source] })
        }

        return results
    }
})

const githubListRepos = defineTransform({
    category: ['github'],

    alias: ['github_list_repos', 'ghlr'],

    title: 'List GitHub Repos',

    description: 'List GitHub repos for a given user/org.',

    group: 'GitHub Repos',

    types: [BRAND_TYPE, GITHUB_ORG_TYPE, GITHUB_USER_TYPE],

    options: {
        forks: {
            description: 'Include forks',
            type: 'boolean',
            default: false
        }
    },

    priority: 1,

    noise: 1,

    transform: async({ source, label, github }, options) => {
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
})

const githubListGists = defineTransform({
    category: ['github'],

    alias: ['github_list_gists', 'ghlg'],

    title: 'List GitHub Gists',

    description: 'List GitHub gists for a given user/org.',

    group: 'GitHub Gists',

    types: [BRAND_TYPE, GITHUB_ORG_TYPE, GITHUB_USER_TYPE],

    options: {},

    priority: 1,

    noise: 1,

    transform: async({ source, label, github }) => {
        const results = []

        for await (let info of github.gists(label)) {
            const { id, html_url: uri, description } = info

            results.push({ type: GITHUB_GIST_TYPE, label: id, props: { id, uri, description, info }, edges: [source] })
        }

        return results
    }
})

module.exports = {
    githubUser,
    githubOrg,
    githubSearchUsers,
    githubListOrgs,
    githubListMembers,
    githubListRepos,
    githubListGists
}
