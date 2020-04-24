const { Socket } = require('net')

const { ports: portsMap } = require('./ports')
const { Transform } = require('../../transform')
const { IPV4_TYPE, IPV6_TYPE, PORT_TYPE } = require('../../types')

const DEFAULT_PORTS = ''
const DEFAULT_TIMEOUT = 5000
const DEFAULT_CONCURRENCY = 500
const DEFAULT_BANNERS = false
const DEFAULT_VALIDATES = false

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

            banners: {
                description: 'Fetch banners',
                type: 'boolean',
                default: DEFAULT_BANNERS
            },

            validates: {
                description: 'Validate port',
                type: 'boolean',
                default: DEFAULT_VALIDATES
            }
        }
    }

    static get priority() {
        return 1
    }

    static get noise() {
        return 1
    }

    async check(port, host, timeout = DEFAULT_TIMEOUT, banners = DEFAULT_BANNERS, validates = DEFAULT_VALIDATES) {
        this.debug('probbing', host, port)

        return new Promise((resolve) => {
            const socket = new Socket()

            socket.setTimeout(timeout)

            const t = setTimeout(() => {
                socket.removeAllListeners()
                socket.destroy()

                resolve([false])
            }, timeout)

            socket.on('connect', () => {
                clearTimeout(t)

                if (banners || validates) {
                    const tt = setTimeout(() => {
                        socket.removeAllListeners()
                        socket.destroy()

                        if (validates) {
                            resolve([false])
                        }
                        else {
                            resolve([true])
                        }
                    }, timeout)

                    socket.once('data', (data) => {
                        clearTimeout(tt)

                        socket.removeAllListeners()
                        socket.destroy()

                        resolve([true, data.slice(0, 512)])
                    })

                    socket.write(Array(100).fill(0).map(Math.random).map(r => r * 100).map(String.fromCharCode).join('') + '\r\n\r\n\0')
                }
                else {
                    socket.removeAllListeners()
                    socket.destroy()

                    resolve([true])
                }
            })

            socket.on('timeout', () => {
                clearTimeout(t)

                socket.removeAllListeners()
                socket.destroy()

                resolve([false])
            })

            socket.on('error', (exception) => {
                clearTimeout(t)

                socket.removeAllListeners()
                socket.destroy()

                resolve([false])
            })

            socket.connect(port, host)
        })
    }

    async handle([{ id: source = '', label = '' }, port], { timeout = DEFAULT_TIMEOUT, banners = DEFAULT_BANNERS, validates = DEFAULT_VALIDATES }) {
        const results = []

        const [open, banner] = await this.check(port, label, timeout, banners, validates)

        if (open) {
            const protocol = 'TCP'
            const state = 'open'
            const services = portsMap[port].map((service) => service.toLowerCase())

            results.push({ type: PORT_TYPE, label: `${port}/${protocol}`, props: { port, protocol, state, services, banner }, edges: [source] })
        }

        return results
    }

    async run(items, { ports = DEFAULT_PORTS, concurrency = DEFAULT_CONCURRENCY, ...options }) {
        if (ports) {
            ports = ports.split(',').map((port) => port.trim()).filter((port) => port).map((port) => parseInt(port, 10))
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
