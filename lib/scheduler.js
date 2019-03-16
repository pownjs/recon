const { sleep } = require('@pown/async/lib/timers')
const { Scheduler: _Scheduler } = require('@pown/request/lib/scheduler')

class Scheduler extends _Scheduler {
    async tryFetch(timesOrConf, uri, ...args) {
        let tryTimes = 5
        let tryDelay = 5000
        let tryResponseCode = 200

        if (typeof(timesOrConf) === 'number') {
            tryTimes = timesOrConf
        }
        else {
            const { times = tryTimes, delay = tryDelay, responseCode = tryResponseCode } = timesOrConf

            tryTimes = times
            tryDelay = delay
            tryResponseCode = responseCode
        }

        let res

        for (let i = 0; i < tryTimes; i++) {
            if (i > 0) {
                await sleep(tryDelay)
            }

            res = await this.fetch(uri, ...args)

            if (res.responseCode === tryResponseCode) {
                break
            }
        }

        if (!res || res.responseCode !== tryResponseCode) {
            throw new Error(`Cannot fetch ${uri}`)
        }

        return res
    }
}

module.exports = { Scheduler }
