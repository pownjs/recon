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

    interpolateObject(input, variables) {
        return input
    }

    async request(method, uri, payload, variables) {
        uri = this.interpolateString(uri, variables)

        if (method !== 'GET' && payload) {
            payload = JSON.stringify(this.interpolateObject(payload))
        }

        this.info(`Requesting remote ${uri}`)

        const { responseBody } = await scheduler.request({ method, uri, body: payload })

        const body = responseBody.toString()

        return body ? JSON.parse(body) : null
    }

    async handle({ id: source = '', label = '' }, options) {
        const { transform } = this.definition

        const { method = 'GET', url, payload, continuationId: continuationIdPath, continuationMethod = 'GET', continuationUrl, continuationPayload, continuationDelay = 30000, items: itemsPath } = transform

        const variables = { ...options, label }

        const result = await this.request(method, url, payload, variables)

        if (!result) {
            return
        }

        let items = []

        if (continuationIdPath && continuationUrl) {
            const continuationId = jsonpath.value(result, continuationIdPath)

            if (continuationId) {
                const continuationVariables = { ...variables, continuationId }

                while (true) {
                    await sleep(continuationDelay)

                    const result = await this.request(continuationMethod, continuationUrl, continuationPayload, continuationVariables)

                    if (!result) {
                        continue
                    }

                    if (itemsPath) {
                        items = jsonpath.value(result, itemsPath)
                    }
                    else {
                        items = result
                    }

                    if (items) {
                        break
                    }
                }
            }
        }
        else {
            if (itemsPath) {
                items = jsonpath.value(result, itemsPath)
            }
            else {
                items = result
            }
        }

        return items.map((item) => {
            const { edges } = item

            return {
                ...item,

                edges: edges ? edges : [source]
            }
        })
    }
}

const denormalizeFields = (uri) => {
    return uri.replace('%7Blabel%7D', '{label}').replace('%7BcontinuationId%7D', '{continuationId}')
}

const fetchRemoteTransforms = async(uri) => {
    const res = await scheduler.fetch(uri)

    const transforms = JSON.parse(res.responseBody)

    Object.values(transforms).forEach(({ transform }) => {
        if (transform.url) {
            transform.url = denormalizeFields(url.resolve(uri, transform.url))
        }

        if (transform.continuationUrl) {
            transform.continuationUrl = denormalizeFields(url.resolve(uri, transform.continuationUrl))
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
