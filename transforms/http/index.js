const uuid = require('uuid')
const crypto = require('crypto')

const { Transform } = require('../../lib//transform')
const { URI_TYPE, STRING_TYPE, CODE_TYPE, TITLE_TYPE, SOFTWARE_TYPE, MIME_TYPE, SHA1_TYPE, FINGERPRINT_TYPE, SIGNATURE_TYPE } = require('../../lib//types')

const NAMESPACE = 'a456d553-d024-45d2-99af-7719a80050b7'

const DEFAULT_TIMEOUT = 30000
const DEFAULT_FOLLOW = false
const DEFAULT_AUGMENT = true
const DEFAULT_DEFUSE = false
const DEFAULT_RESPONSE_BODY_SNIFF_SIZE = 512

const httpFingerprint = class extends Transform {
    static get alias() {
        return ['http_fingerprint', 'hf']
    }

    static get title() {
        return 'HTTP Fingerprint'
    }

    static get description() {
        return 'Performs a fingerprint on the HTTP server and application'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce', 'local', 'http']
    }

    static get types() {
        return [URI_TYPE]
    }

    static get options() {
        return {
            timeout: {
                description: 'HTTP timeout interval',
                type: 'number',
                default: DEFAULT_TIMEOUT
            },

            follow: {
                description: 'Follow redirects',
                type: 'boolean',
                default: DEFAULT_FOLLOW
            },

            augment: {
                description: 'Augment input node with result nodes',
                type: 'boolean',
                default: DEFAULT_AUGMENT
            },

            defuse: {
                description: 'Prevention extraction of sub types',
                type: 'boolean',
                default: DEFAULT_DEFUSE
            },

            responseBodySniffSize: {
                description: 'The size of the response body sniff',
                type: 'number',
                default: DEFAULT_RESPONSE_BODY_SNIFF_SIZE
            }
        }
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 1
    }

    // NOTE: It is possible to keep the number of nodes at minimum by default. This transform can simply generate a fingerprint node. If other transforms
    // require to work on individual fields, they can perform their own extraction first. Something to consider for future improvements.

    async handle({ id: source = '', label = '', props, ...rest }, { timeout = DEFAULT_TIMEOUT, follow = DEFAULT_FOLLOW, augment = DEFAULT_AUGMENT, defuse = DEFAULT_DEFUSE, responseBodySniffSize = DEFAULT_RESPONSE_BODY_SNIFF_SIZE }) {
        const results = []

        // TODO: build a separate module to fingerprint http servers and use instead of this

        const headers = {
            'User-Agent': 'Mozilla/5.0 (Macintosh; Intel Mac OS X 10.15; rv:73.0) Gecko/20100101 Firefox/73.0',
            'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/webp,*/*;q=0.8',
            'Accept-Language': 'en;q=0.5',
            'Accept-Encoding': 'deflate, gzip'
        }

        const { url = label, uri = url } = props

        const { responseCode, responseHeaders, responseBody } = await this.scheduler.request({ uri, headers, timeout, follow, downloadLimit: DEFAULT_RESPONSE_BODY_SNIFF_SIZE, rejectUnauthorized: false })

        if (!responseCode) {
            return results
        }

        const responseBodySniff = responseBody ? responseBody.slice(0, responseBodySniffSize).toString() : ''

        const signature = uuid.v5([responseCode, responseHeaders['location'], responseHeaders['content-location'], responseBodySniff].filter(f => f).join(':::'), NAMESPACE)

        const getHeader = (headers, name) => {
            let header = headers[name]

            if (!header) {
                return
            }

            if (Array.isArray(header)) {
                header = header[0]
            }

            if (!header) {
                return
            }

            return header.trim()
        }

        let server = getHeader(responseHeaders, 'server')
        let contentType = getHeader(responseHeaders, 'content-type')

        let sha1
        let title
        let software

        if (responseBodySniff) {
            sha1 = crypto.createHash('sha1').update(responseBodySniff).digest('hex')

            const titleMatch = responseBodySniff.match(/<title>([^<]+)/i)

            if (titleMatch) {
                title = titleMatch[1]
            }

            const generatorMatch = responseBodySniff.match(/<meta\s+name="generator"\s+content="(.+?)"|<meta\s+content="(.+?)"\s+name="generator"/i)

            if (generatorMatch) {
                software = generatorMatch[1].toLowerCase()
            }
        }

        if (augment) {
            results.push({ id: source, label, props: { ...props, responseCode, responseHeaders, responseBodySniff, signature, title, software, sha1 }, ...rest })
        }

        if (!augment || !defuse) {
            if (signature) {
                results.push({ type: SIGNATURE_TYPE, label: signature, props: { signature }, edges: [{ source, type: FINGERPRINT_TYPE }] })
            }

            if (sha1) {
                results.push({ type: SHA1_TYPE, label: sha1, props: { sha1 }, edges: [{ source, type: FINGERPRINT_TYPE }] })
            }

            if (title) {
                results.push({ type: TITLE_TYPE, label: title, props: { title }, edges: [{ source, type: FINGERPRINT_TYPE }] })
            }

            if (software) {
                results.push({ type: SOFTWARE_TYPE, label: `${software}`, props: { software }, edges: [{ source, type: FINGERPRINT_TYPE }] })
            }

            if (responseCode) {
                results.push({ type: CODE_TYPE, label: `${responseCode}/HTTP`, props: { code: responseCode }, edges: [{ source, type: FINGERPRINT_TYPE }] })
            }

            if (server) {
                server = server.trim()

                results.push({ type: SOFTWARE_TYPE, label: `${server}`, props: { server }, edges: [{ source, type: FINGERPRINT_TYPE }] })
            }

            if (contentType) {
                contentType = contentType.trim().toLowerCase()

                results.push({ type: MIME_TYPE, label: `${contentType}`, props: { contentType }, edges: [{ source, type: FINGERPRINT_TYPE }] })
            }
        }

        return results
    }
}

module.exports = { httpFingerprint }
