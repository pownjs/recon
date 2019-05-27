const { sleep } = require('@pown/async/lib/timers')
const { Scheduler: _Scheduler } = require('@pown/request/lib/scheduler')

class Scheduler extends _Scheduler {
    async tryFetch(timesOrConf, uri, ...args) {
        if (typeof(timesOrConf) === 'string') {
            args.unshift(uri)
            uri = timesOrConf
            timesOrConf = 1
        }

        let tryTimes = 5
        let tryDelay = 5000

        if (typeof(timesOrConf) === 'number') {
            tryTimes = timesOrConf
        }
        else {
            const { times = tryTimes, delay = tryDelay } = timesOrConf

            tryTimes = times
            tryDelay = delay
        }

        let res

        for (let i = 0; i < tryTimes; i++) {
            if (i > 0) {
                await sleep(tryDelay)
            }

            res = await this.fetch(uri, ...args)

            if (res.info.error) {
                if (process.env.POWN_DEBUG) {
                    console.debug(res.info.error)
                }
            }
            else {
                if (process.env.POWN_DEBUG) {
                    console.debug(`GET ${uri} -> ${res.responseCode}`, Buffer.from(res.responseBody))
                }

                if (res.responseCode < 500) {
                    break
                }
            }
        }

        if (!res || res.responseCode >= 500) {
            throw new Error(`Cannot fetch ${uri} -> ${res.responseCode}`)
        }

        return res
    }

    async tryRequest(timesOrConf, request, ...args) {
        if (timesOrConf.uri) {
            args.unshift(request)
            request = timesOrConf
            timesOrConf = 1
        }

        let tryTimes = 5
        let tryDelay = 5000

        if (typeof(timesOrConf) === 'number') {
            tryTimes = timesOrConf
        }
        else {
            const { times = tryTimes, delay = tryDelay } = timesOrConf

            tryTimes = times
            tryDelay = delay
        }

        let res

        for (let i = 0; i < tryTimes; i++) {
            if (i > 0) {
                await sleep(tryDelay)
            }

            res = await this.request(request, ...args)

            if (res.info.error) {
                if (process.env.POWN_DEBUG) {
                    console.debug(res.info.error)
                }
            }
            else {
                if (process.env.POWN_DEBUG) {
                    console.debug(`${res.method || 'GET'} ${res.uri} -> ${res.responseCode}`, Buffer.from(res.responseBody))
                }

                if (res.responseCode < 500) {
                    break
                }
            }
        }

        if (!res || res.responseCode >= 500) {
            throw new Error(`Cannot request ${res.method} ${res.uri} -> ${res.responseCode}`)
        }

        return res
    }
}

module.exports = { Scheduler }
