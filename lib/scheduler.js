const { sleep } = require('@pown/async/lib/sleep')
const { Scheduler: PownScheduler } = require('@pown/request/lib/scheduler')

class Scheduler extends PownScheduler {
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
                console.debug(`${res.method || 'GET'} ${res.uri} ->`, res.info.error)
            }
            else {
                console.debug(`${res.method || 'GET'} ${res.uri} -> ${res.responseCode}`, Buffer.from(res.responseBody))

                if (res.responseCode < 500) {
                    break
                }
            }
        }

        if (!res || res.responseCode >= 500) {
            throw new Error(`Cannot request ${res.method} ${res.uri} -> ${res.responseCode}`)
        }

        if (request.toJson) {
            try {
                return JSON.parse(res.responseBody)
            }
            catch (e) {
                if (process.env.NODE_ENV !== 'production') {
                    console.error(e)
                }
            }
        }

        return res
    }
}

module.exports = { Scheduler }
