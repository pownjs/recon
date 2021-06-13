const url = require('url')
const jsonpath = require('jsonpath')
const { sleep } = require('@pown/async/lib/sleep')

const { Scheduler } = require('./scheduler')
const { Transform } = require('./transform')

const scheduler = new Scheduler()

class RemoteTransform extends Transform {
    constructor({ definition, ...options }) {
        super(options)

        this.definition = definition
    }

    interpolateUrlString(input, variables) {
        Object.entries(variables).forEach(([name, value]) => {
            input = input.replace(`{${name}}`, encodeURIComponent(value))
        })

        return input
    }

    interpolateString(input, variables) {
        Object.entries(variables).forEach(([name, value]) => {
            input = input.replace(`{${name}}`, value)
        })

        return input
    }

    interpolateBodyObject(input, variables) {
        return Object.assign({}, ...Object.entries(input).map(([name, value]) => {
            if (value) {
                if (value._ref) {
                    return {
                        [name]: variables[value._ref]
                    }
                }
                else {
                    return {
                        [name]: this.interpolateString(value, variables)
                    }
                }
            }
            else {
                return {
                    [name]: undefined
                }
            }
        }))
    }

    async request(method, uri, body, variables) {
        uri = this.interpolateUrlString(uri, variables)

        if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && body) {
            if (typeof(body) === 'string') {
                body = this.interpolateString(body, variables)
            }
            else {
                body = JSON.stringify(this.interpolateBodyObject(body, variables))
            }
        }

        this.info(`requesting remote endpoint ${uri}`)

        return await this.scheduler.tryRequest({ method, uri, body, toJson: true })
    }

    async * paginate({ id: source = '', label = '' }, options) {
        const { transform } = this.definition

        const { method = 'GET', url, body, continuationId: continuationIdPath, continuationMethod = 'GET', continuationUrl, continuationBody, continuationDelay = 30000, items: itemsPath } = transform

        const variables = { ...options, source, label }

        let result

        result = await this.request(method, url, body, variables)

        if (options.noWait) {
            return
        }

        if (result) {
            let items

            if (itemsPath) {
                items = jsonpath.value(result, itemsPath)
            }
            else {
                items = result
            }

            if (items) {
                yield items
            }
        }
        else {
            return
        }

        if (continuationIdPath && continuationUrl) {
            for (;;) {
                const continuationId = jsonpath.value(result, continuationIdPath)

                if (continuationId) {
                    await sleep(continuationDelay)

                    const continuationVariables = { ...variables, continuationId }

                    result = await this.request(continuationMethod, continuationUrl, continuationBody, continuationVariables)

                    if (result) {
                        let items

                        if (itemsPath) {
                            items = jsonpath.value(result, itemsPath) || []
                        }
                        else {
                            items = result || []
                        }

                        if (items) {
                            yield items
                        }
                    }
                }
                else {
                    break
                }
            }
        }
    }

    async handle(node, options) {
        const { id: source = '' } = node

        let results = []

        for await (const items of this.paginate(node, options)) {
            const subresults = items.map((item) => {
                const { edges } = item

                return {
                    ...item,

                    edges: edges ? edges.map((edge) => (typeof(edge) === 'string' ? edge : { source, ...edge })) : [source]
                }
            })

            results = results.concat(subresults)
        }

        return results
    }

    async run(nodes, options, concurrency) {
        const { transform } = this.definition

        const { concurrency: definitionTransformConcurrency = concurrency } = transform

        return await super.run(nodes, options, definitionTransformConcurrency)
    }
}

const resolveUrl = (from, to) => {
    const c1 = Math.random().toString()
    const c2 = Math.random().toString()

    return url.resolve(from, to.split('{').join(c1).split('}').join(c2)).split(c1).join('{').split(c2).join('}')
}

const fetchRemoteTransforms = async(uri) => {
    const res = await scheduler.request({ uri })

    const transforms = JSON.parse(res.responseBody)

    Object.values(transforms).forEach(({ transform }) => {
        if (transform.url) {
            transform.url = resolveUrl(uri, transform.url)
        }

        if (transform.continuationUrl) {
            transform.continuationUrl = resolveUrl(uri, transform.continuationUrl)
        }
    })

    return transforms
}

const buildRemoteTransform = (remoteTransform) => {
    return {
        ...remoteTransform,

        load: function() {
            return class extends RemoteTransform {
                static get alias() {
                    return remoteTransform.alias
                }

                static get title() {
                    return remoteTransform.title
                }

                static get description() {
                    return remoteTransform.description
                }

                static get group() {
                    return remoteTransform.group
                }

                static get tags() {
                    return remoteTransform.tags
                }

                static get types() {
                    return remoteTransform.types
                }

                static get options() {
                    return {
                        ...remoteTransform.options,

                        noWait: {
                            description: 'Do not wait for the remote transform to finish',
                            type: 'boolean',
                            default: false
                        }
                    }
                }

                static get priority() {
                    return remoteTransform.priority
                }

                static get noise() {
                    return remoteTransform.noise
                }

                constructor(options) {
                    super({ ...options, definition: remoteTransform })
                }
            }
        }
    }
}

const buildRemoteTransforms = (remoteTransforms) => {
    const transforms = {}

    Object.entries(remoteTransforms).forEach(([, definitions]) => {
        Object.entries(definitions).forEach(([name, definition]) => {
            transforms[name] = buildRemoteTransform(definition)
        })
    })

    return transforms
}

module.exports = { fetchRemoteTransforms, buildRemoteTransforms, buildRemoteTransform }
