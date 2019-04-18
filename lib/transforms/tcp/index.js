const { Socket } = require('net')
const { eachOfParallel } = require('@pown/async/lib/eachOfParalel')

const { ports: portsMap } = require('./ports')
const { Transform } = require('../../transform')
const { DOMAIN_TYPE, IPV4_TYPE, IPV6_TYPE, PORT_TYPE } = require('../../types')

const DEFAULT_PORTS = ''
const DEFAULT_TIMEOUT = 5000
const DEFAULT_CONCURRENCY = Number.MAX_VALUE

const tcpPortScan = class extends Transform {
    static get alias() {
        return ['tcp_port_scan', 'tps']
    }

    static get title() {
        return 'TCP Port Scan'
    }

    static get description() {
        return 'Simple port scanner'
    }

    static get group() {
        return this.title
    }

    static get tags() {
        return ['ce', 'local', 'tcp']
    }

    static get types() {
        return [DOMAIN_TYPE, IPV4_TYPE, IPV6_TYPE]
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
            }
        }
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 1
    }

    async check(port, host, timeout = DEFAULT_TIMEOUT) {
        return new Promise((resolve) => {
            const socket = new Socket()

            socket.setTimeout(timeout)

            socket.on('connect', () => {
                socket.destroy()

                resolve(true)
            })

            socket.on('timeout', () => {
                socket.destroy()

                resolve(false)
            })

            socket.on('error', (exception) => {
                socket.destroy()

                resolve(false)
            })

            socket.connect(port, host)
        })
    }

    async handle({ id: source = '', label = '' }, { ports = [], timeout = DEFAULT_TIMEOUT }) {
        const results = []

        await eachOfParallel(ports, async(port) => {
            const open = await this.check(port, label, timeout)

            if (open) {
                const protocol = 'TCP'
                const state = 'open'
                const services = portsMap[port].map((service) => service.toLowerCase())

                results.push({ type: PORT_TYPE, label: `${port}/${protocol}`, props: { port, protocol, state, services }, edges: [source] })
            }
        })

        return results
    }

    async run(item, { ports = DEFAULT_PORTS, timeout = DEFAULT_TIMEOUT, concurrency = DEFAULT_CONCURRENCY }) {
        if (ports) {
            ports = ports.split(',').map((port) => port.trim()).filter((port) => port).map((port) => parseInt(port, 10))
        }
        else {
            ports = Object.keys(portsMap)
        }

        return super.run(item, { ports, timeout }, concurrency)
    }
}

module.exports = { tcpPortScan }
