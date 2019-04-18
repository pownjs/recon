const url = require('url')
const jsonpath = require('jsonpath')
const { sleep } = require('@pown/async/lib/timers')

const { Scheduler } = require('./scheduler')
const { Transformer } = require('./transformer')

const scheduler = new Scheduler()

class RemoteTransform extends Transformer {
    constructor(definition) {
        super()

        this.definition = definition
    }

    interpolateString(input, variables) {
        Object.entries(variables).forEach(([name, value]) => {
            input = input.replace(`{${name}}`, value)
        })

        return input
    }

    interpolateUrlString(input, variables) {
        Object.entries(variables).forEach(([name, value]) => {
            input = input.replace(`{${name}}`, encodeURIComponent(value))
        })

        return input
    }

    interpolateBodyObject(input, variables) {
        return Object.assign({}, ...Object.entries(input).map(([name, value]) => {
            return {
                [name]: this.interpolateString(value, variables)
            }
        }))
    }

    async request(method, uri, body, variables) {
        uri = this.interpolateUrlString(uri, variables)

        if (!['GET', 'HEAD', 'OPTIONS'].includes(method) && body) {
            if (typeof(body) === 'string') {
                body = this.interpolateUrlString(body)
            }
            else {
                body = JSON.stringify(this.interpolateBodyObject(body))
            }
        }

        this.info(`Requesting remote endpoint ${uri}`)

        const { responseBody } = await scheduler.request({ method, uri, body })

        const result = responseBody.toString()

        return result ? JSON.parse(result) : null
    }

    async * paginate({ id: source = '', label = '' }, options) {
        const { transform } = this.definition

        const { method = 'GET', url, body, continuationId: continuationIdPath, continuationMethod = 'GET', continuationUrl, continuationBody, continuationDelay = 30000, items: itemsPath } = transform

        const variables = { ...options, source, label }

        let result

        result = await this.request(method, url, body, variables)

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
            while (true) {
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
        let results = []

        for await (const items of this.paginate(node, options)) {
            const subresults = items.map((item) => {
                const { edges } = item

                return {
                    ...item,

                    edges: edges ? edges : [source]
                }
            })

            results = results.concat(subresults)
        }

        return results
    }
}

const resolveUrl = (from, to) => {
    const c1 = Math.random().toString()
    const c2 = Math.random().toString()

    return url.resolve(from, to.split('{').join(c1).split('}').join(c2)).split(c1).join('{').split(c2).join('}')
}

const fetchRemoteTransforms = async(uri) => {
    const res = await scheduler.fetch(uri)

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
            return class {
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

                constructor() {
                    this.t = new RemoteTransform(remoteTransform)
                }

                on(...args) {
                    return this.t.on(...args)
                }

                off(...args) {
                    return this.t.off(...args)
                }

                run(...args) {
                    return this.t.run(...args)
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
