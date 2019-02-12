// const assert = require('assert')
// const { Scheduler } = require('@pown/request/lib/scheduler')
// const { eachOfLimit } = require('@pown/async/lib/eachOfLimit')

// const db = require('../lib/transforms/whatsmyname/db')
// const { whatsmynameReport } = require('../lib/transforms/whatsmyname')

// describe('whatsmyname', () => {
//     describe('db', () => {
//         it('must checkout', async() => {
//             const transform = new whatsmynameReport()

//             const generateRequests = function*() {
//                 for (const site of db.sites) {
//                     const { known_accounts = [], valid = false } = site

//                     if (!valid) {
//                         continue
//                     }

//                     for (const account of known_accounts) {
//                         yield transform.buildTransaction(account, site)
//                     }
//                 }
//             }

//             const scheduler = new Scheduler()

//             await eachOfLimit(generateRequests(), 10, async({ site, account, ...req }) => {
//                 assert.ok(transform.accountExists(site, await scheduler.request(req)), `${site.name}:::${account} -> ${req.uri}`)
//             })
//         }).timeout(0)
//     })
// })
