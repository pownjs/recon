const crypto = require('crypto')
const { connect } = require('@pown/connect')

const { isIp } = require('../../lib/detect')
const { makeId } = require('../../lib//utils')
const { Transform } = require('../../lib//transform')
const { ports: portsMap, protocols: protocolsMap } = require('./ports')
const { IPV4_TYPE, IPV6_TYPE, PORT_TYPE, TLS_TYPE, BANNER_TYPE, CERTIFICATE_TYPE } = require('../../lib/types')

const DEFAULT_PORTS = ''
const DEFAULT_TIMEOUT = 5000
const DEFAULT_CONCURRENCY = 500
const DEFAULT_BE_SMART = false
const DEFAULT_WITH_BANNERS = false
const DEFAULT_WITH_CERTIFICATES = false

const TLS_DATA = Buffer.from([16, 0x03, 0x01, 0x00, 0xa5, 0x01, 0x00, 0x00, 0xa1, 0x03, 0x03, 0x00, 0x01, 0x02, 0x03, 0x04, 0x05, 0x06, 0x07, 0x08, 0x09, 0x0a, 0x0b, 0x0c, 0x0d, 0x0e, 0x0f, 0x10, 0x11, 0x12, 0x13, 0x14, 0x15, 0x16, 0x17, 0x18, 0x19, 0x1a, 0x1b, 0x1c, 0x1d, 0x1e, 0x1f, 0x00, 0x00, 0x20, 0xcc, 0xa8, 0xcc, 0xa9, 0xc0, 0x2f, 0xc0, 0x30, 0xc0, 0x2b, 0xc0, 0x2c, 0xc0, 0x13, 0xc0, 0x09, 0xc0, 0x14, 0xc0, 0x0a, 0x00, 0x9c, 0x00, 0x9d, 0x00, 0x2f, 0x00, 0x35, 0xc0, 0x12, 0x00, 0x0a, 0x01, 0x00, 0x00, 0x58, 0x00, 0x00, 0x00, 0x18, 0x00, 0x16, 0x00, 0x00, 0x13, 0x65, 0x78, 0x61, 0x6d, 0x70, 0x6c, 0x65, 0x2e, 0x75, 0x6c, 0x66, 0x68, 0x65, 0x69, 0x6d, 0x2e, 0x6e, 0x65, 0x74, 0x00, 0x05, 0x00, 0x05, 0x01, 0x00, 0x00, 0x00, 0x00, 0x00, 0x0a, 0x00, 0x0a, 0x00, 0x08, 0x00, 0x1d, 0x00, 0x17, 0x00, 0x18, 0x00, 0x19, 0x00, 0x0b, 0x00, 0x02, 0x01, 0x00, 0x00, 0x0d, 0x00, 0x12, 0x00, 0x10, 0x04, 0x01, 0x04, 0x03, 0x05, 0x01, 0x05, 0x03, 0x06, 0x01, 0x06, 0x03, 0x02, 0x01, 0x02, 0x03, 0xff, 0x01, 0x00, 0x01, 0x00, 0x00, 0x12, 0x00, 0x00])
const RANDOM_DATA = Buffer.from(Array(100).fill(0).map(Math.random).map(r => r * 100).map(String.fromCharCode).join(''))
const CRLF_DATA = Buffer.from('\r\n\r\n\0')
const HTTP_DATA = Buffer.from('GET / HTTP/1.0\r\n\r\n')

const STRING_DATA = Buffer.concat([RANDOM_DATA, CRLF_DATA])
const PROBABLE_DATA = Buffer.concat([TLS_DATA, STRING_DATA])

const tcpPortScan = class extends Transform {
    static get alias() {
        return ['tcp_port_scan', 'tps']
    }

    static get title() {
        return 'TCP Port Scan'
    }

    static get description() {
        return 'Simple, full-handshake TCP port scanner (very slow and sometimes inaccurate)'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce', 'local', 'tcp']
    }

    static get types() {
        return [IPV4_TYPE, IPV6_TYPE]
    }

    static get options() {
        return {
            ports: {
                description: 'The ports to scan for',
                type: 'string',
                default: DEFAULT_PORTS
            },

            timeout: {
                description: 'The socket timeout interval',
                type: 'number',
                default: DEFAULT_TIMEOUT
            },

            concurrency: {
                description: 'Number of concurrent scans',
                type: 'number',
                default: DEFAULT_CONCURRENCY
            },

            beSmart: {
                description: 'Use smart protocol detection',
                type: 'boolean',
                default: DEFAULT_BE_SMART,
                alias: ['smart']
            },

            withBanners: {
                description: 'Fetch banners',
                type: 'boolean',
                default: DEFAULT_WITH_BANNERS,
                alias: ['with-banner', 'banners', 'banner']
            },

            withCertificates: {
                description: 'Fetch certificates',
                type: 'boolean',
                default: DEFAULT_WITH_CERTIFICATES,
                alias: ['with-certificate', 'certificates', 'certificate']
            }
        }
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 1
    }

    async check({ port, host, timeout = DEFAULT_TIMEOUT, withBanners = DEFAULT_WITH_BANNERS, beSmart = DEFAULT_BE_SMART, withCertificates = DEFAULT_WITH_CERTIFICATES }) {
        this.debug('probbing', host, port)

        const options = {
            port,
            host,

            timeout,

            download: withBanners
        }

        if (withBanners) {
            options.data = PROBABLE_DATA

            if (beSmart) {
                if (protocolsMap['HTTP'].includes(port)) {
                    options.data = HTTP_DATA
                }
                else
                if (protocolsMap['HTTPS'].includes(port)) {
                    options.data = HTTP_DATA
                    options.tls = true
                    options.rejectUnauthorized = false
                    options.certificate = withCertificates

                    if (!isIp(host)) {
                        options.servername = host
                    }
                }
            }
        }

        const { responseData, info } = await connect(options)

        const result = [info.open]

        const props = {}

        if (beSmart) {
            props.tls = options.tls
        }

        result.push(props)

        if (withBanners) {
            result.push(responseData.slice(0, 512))
        }

        if (withCertificates) {
            result.push(info.certificate)
        }

        return result
    }

    async handle([{ id: source = '', label = '' }, port], options) {
        port = parseInt(port)

        const results = []

        const [open, { tls }, banner, certificate] = await this.check({ port, host: label, ...options })

        if (open) {
            const protocol = 'TCP'
            const services = portsMap[port].map((service) => service.toLowerCase())

            const portLabel = `${port}/${protocol}`
            const portId = makeId(PORT_TYPE, portLabel)

            results.push({ id: portId, type: PORT_TYPE, label: portLabel, props: { port, protocol, services }, edges: [tls ? { type: TLS_TYPE, source } : source] })

            if (banner && banner.length) {
                const bannerLabel = crypto.createHash('sha1').update(banner).digest('hex')
                const bannerId = makeId(BANNER_TYPE, bannerLabel)

                results.push({ id: bannerId, type: BANNER_TYPE, label: bannerLabel, props: { banner, tls, port }, edges: [source, portId] })
            }

            if (certificate) {
                const { subject, issuer, subjectaltname, infoAccess, valid_from, valid_to, fingerprint256, fingerprint, serialNumber } = certificate

                const certificateLabel = fingerprint256 || fingerprint
                const certificateId = makeId(CERTIFICATE_TYPE, certificateLabel)

                results.push({ id: certificateId, type: CERTIFICATE_TYPE, label: certificateLabel, props: { certificate: { subject, issuer, subjectaltname, infoAccess, valid_from, valid_to, fingerprint256, fingerprint, serialNumber }, port }, edges: [source, portId] })
            }
        }

        return results
    }

    async run(items, { ports = DEFAULT_PORTS, concurrency = DEFAULT_CONCURRENCY, ...options }) {
        if (ports) {
            ports = ports.split(',').map((port) => port.trim()).filter((port) => port).map((port) => parseInt(port))
        }
        else {
            ports = Object.keys(portsMap)
        }

        const it = (function*() {
            for (let item of items) {
                for (let port of ports) {
                    yield [item, port]
                }
            }
        })()

        it.length = items.length * ports.length

        return await super.run(it, options, concurrency)
    }
}

module.exports = { tcpPortScan }
