const { parentPort } = require('worker_threads')

parentPort.on('message', (node) => {
    parentPort.postMessage({ type: 'new-type', label: 'new-label', props: { title: 'It works!' } })
})
