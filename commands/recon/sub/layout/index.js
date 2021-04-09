exports.yargs = {
    command: 'layout <name>',
    describe: 'Layout the graph',
    aliases: ['k'],

    builder: (yargs) => {
        const { installReadOptions, installWriteOptions } = require('../../lib/handlers/file')

        installReadOptions(yargs)
        installWriteOptions(yargs)
    },

    handler: async(argv) => {
        const { name } = argv

        const { cytoscape } = require('../../../../lib/cytoscape')

        const klay = require('cytoscape-klay')
        const dagre = require('cytoscape-dagre')
        const euler = require('cytoscape-euler')

        cytoscape.use(klay)
        cytoscape.use(dagre)
        cytoscape.use(euler)

        const { recon } = require('../../lib/globals/recon')

        recon.resetGraph({
            headless: true,

            styleEnabled: true
        })

        const { handleReadOptions, handleWriteOptions } = require('../../lib/handlers/file')

        await handleReadOptions(argv, recon)

        const layout = recon.elements().layout({
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
