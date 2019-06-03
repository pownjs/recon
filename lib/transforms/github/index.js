const Github = require('@pown/github/lib/github')

const { BRAND_TYPE } = require('../../types')
const { Transform } = require('../../transform')

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
                githubKey: {
                    description: 'GitHub API Key. The key is either in the format username:password or username:token.',
                    type: 'string'
                }
            }
        }

        async handle({ id: source = '', label = '' }, options) {
            const { githubKey = process.env.GITHUB_KEY } = options

            const github = new Github({ githubKey })

            return def.transform({ source, label, github })
        }
    }
}

const githubListOrgs = defineTransform({
    alias: ['github_list_orgs', 'ghlo'],

    title: 'List GitHub Orgs',

    description: 'List GitHub orgs for a given member.',

    group: 'GitHub Orgs',

    types: [BRAND_TYPE, GITHUB_USER_TYPE],

    priority: 1,

    noise: 1,

    transform: async({ source, label, github }) => {
        const results = []

        for await (let info of github.orgs(label)) {
            const { login, url, avatar_url } = info

            results.push({ type: GITHUB_ORG_TYPE, label: login, image: avatar_url, props: { login, url, info }, edges: [source] })
        }

        return results
    }
})

const githubListMembers = defineTransform({
    alias: ['github_list_members', 'ghlm'],

    title: 'List GitHub Members',

    description: 'List GitHub members for a given org.',

    group: 'GitHub Members',

    types: [BRAND_TYPE, GITHUB_ORG_TYPE],

    priority: 1,

    noise: 1,

    transform: async({ source, label, github }) => {
        const results = []

        for await (let info of github.members(label)) {
            const { login, url, avatar_url } = info

            results.push({ type: GITHUB_USER_TYPE, label: login, image: avatar_url, props: { login, url, info }, edges: [source] })
        }

        return results
    }
})

const githubListRepos = defineTransform({
    alias: ['github_list_repos', 'ghlr'],

    title: 'List GitHub Repos',

    description: 'List GitHub repos for a given user/org.',

    group: 'GitHub Repos',

    types: [BRAND_TYPE, GITHUB_ORG_TYPE, GITHUB_USER_TYPE],

    priority: 1,

    noise: 1,

    transform: async({ source, label, github }) => {
        const results = []

        for await (let info of github.repos(label)) {
            const { name, url, description } = info

            results.push({ type: GITHUB_REPO_TYPE, label: name, props: { name, url, description, info }, edges: [source] })
        }

        return results
    }
})

const githubListGists = defineTransform({
    alias: ['github_list_gists', 'ghlg'],

    title: 'List GitHub Gists',

    description: 'List GitHub gists for a given user/org.',

    group: 'GitHub Gists',

    types: [BRAND_TYPE, GITHUB_ORG_TYPE, GITHUB_USER_TYPE],

    priority: 1,

    noise: 1,

    transform: async({ source, label, github }) => {
        const results = []

        for await (let info of github.gists(label)) {
            const { name, url, description } = info

            results.push({ type: GITHUB_GIST_TYPE, label: name, props: { name, url, description, info }, edges: [source] })
        }

        return results
    }
})

module.exports = {
    githubListOrgs,
    githubListMembers,
    githubListRepos,
    githubListGists
}
