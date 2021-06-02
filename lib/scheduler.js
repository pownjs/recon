const { sleep } = require('@pown/async/lib/sleep')
const { Scheduler: PownScheduler } = require('@pown/request/lib/scheduler')

class Scheduler extends PownScheduler {
    // NOTE: it is tempting to overload the request method but we do not do that here because the scheduler could be used by other
    // libraries and as a result this specific behaviour might be unexpected side-effect

    async tryRequest(request) {
        if (request.headers && !request.headers['user-agent']) {
            request = { ...request, headers: { ...request.headers, 'user-agent': 'pown' } }
        }

        const { maxRetries = 5, retryDely = 5000 } = request

        let res

        for (let i = 0; i < maxRetries; i++) {
            if (i > 0) {
                await sleep(retryDely)
            }

            try {
                res = await this.request(request)
            }
            catch (e) {
                if (process.env.NODE_ENV !== 'production') {
                    console.error(e)
                }

                continue
            }

            if (res.info.error) {
                console.error(`${res.method || 'GET'}`, res.uri, '->', res.info.error)
            }
            else {
                console.debug(`${res.method || 'GET'}`, res.uri, '->', res.responseCode, Buffer.from(res.responseBody).slice(0, 512).toString('base64'))

                if (res.responseCode < 500) {
                    break
                }
            }
        }

        if (!res || res.responseCode >= 500) {
            throw new Error(`Cannot request ${res.method} ${res.uri} -> ${res.responseCode}`)
        }

        if (request.toJson || request.toJSON) {
            return JSON.parse(res.responseBody)
        }
        else {
            return res
        }
    }
}

module.exports = { Scheduler }
