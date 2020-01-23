exports.yargs = {
    command: 'layout <name>',
    describe: 'Layout the graph',
    aliases: ['r'],

    builder: (yargs) => {
        const { installReadOptions, installWriteOptions } = require('./handlers/file')

        installReadOptions(yargs)
        installWriteOptions(yargs)
    },

    handler: async(argv) => {
        const { name } = argv

        const { cytoscape } = require('../../cytoscape')

        const klay = require('cytoscape-klay')
        const dagre = require('cytoscape-dagre')
        const euler = require('cytoscape-euler')

        cytoscape.use(klay)
        cytoscape.use(dagre)
        cytoscape.use(euler)

        const { recon } = require('./globals/recon')

        const { handleReadOptions, handleWriteOptions } = require('./handlers/file')

        await handleReadOptions(argv, recon)

        const layout = recon.getCurrentElements().layout({
            boundingBox: { x1: 0, y1: 0, w: 4096, h: 3072 },

            name: name,

            animate: false,

            nodeDimensionsIncludeLabels: true
        })

        const promise = layout.pon('layoutstop')

        await layout.run()

        await promise

        await handleWriteOptions(argv, recon)
    }
}
