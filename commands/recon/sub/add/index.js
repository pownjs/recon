exports.yargs = {
    command: 'add <nodes...>',
    describe: 'Add nodes',
    aliases: ['a'],

    builder: (yargs) => {
        yargs.options('group', {
            alias: 'g',
            type: 'string',
            describe: 'Group nodes',
            default: ''
        })

        yargs.option('node-type', {
            type: 'string',
            describe: 'The type for new nodes',
            default: 'string'
        })

        yargs.option('node-props', {
            type: 'string',
            describe: 'The props for new nodes',
            default: ''
        })

        yargs.option('node-props-file', {
            type: 'string',
            describe: 'A file for the props for new nodes',
            default: ''
        })

        yargs.options('select', {
            alias: 's',
            type: 'string',
            describe: 'Select graph. Nodes will be added and linked only if graph contains at least one node',
            default: ''
        })

        yargs.options('traverse', {
            alias: 'v',
            type: 'string',
            describe: 'Traverse graph. Nodes will be added and linked only if graph contains at least one node',
            default: false
        })

        const { installReadOptions, installWriteOptions } = require('../../lib/handlers/file')

        installReadOptions(yargs)
        installWriteOptions(yargs)

        const { installOutputOptions } = require('../../lib/handlers/output')

        installOutputOptions(yargs)
    },

    handler: async(argv) => {
        const { group, nodeType, nodeProps, nodePropsFile, select, traverse, nodes } = argv

        const { recon } = require('../../lib/globals/recon')

        const { handleReadOptions, handleWriteOptions } = require('../../lib/handlers/file')

        await handleReadOptions(argv, recon)

        let ifNodes

        if (select) {
            ifNodes = recon.select(select)
        }
        else
        if (traverse) {
            ifNodes = recon.traverse(traverse)
        }

        if (!ifNodes || (ifNodes && ifNodes.length > 0)) {
            const { makeId } = require('../../../../lib/utils')

            const { readFile } = require('fs')
            const { promisify } = require('util')

            const readFileAsync = promisify(readFile)

            const nodePropsObj = nodeProps ? JSON.parse(nodeProps) : {}

            const nodePropsFileObj = nodePropsFile ? JSON.parse(await readFileAsync(nodePropsFile)) : {}

            const nodeEdges = (ifNodes ? ifNodes.map((node) => node.data('id')) : [])

            const properNodes = nodes
                .filter((node) => {
                    return node
                })
                .map((node) => ({
                    id: makeId(nodeType, node),
                    type: nodeType,
                    label: node,
                    props: {
                        [nodeType]: node,

                        ...nodePropsObj,
                        ...nodePropsFileObj
                    },
                    edges: nodeEdges
                }))

            await recon.addNodes(properNodes)

            if (group) {
                recon.group(group)
            }

            await handleWriteOptions(argv, recon)

            const { handleOutputOptions } = require('../../lib/handlers/output')

            await handleOutputOptions(argv, properNodes)
        }
    }
}
