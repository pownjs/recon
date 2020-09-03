exports.yargs = {
    command: 'summary',
    describe: 'Create a summary',
    aliases: ['y'],

    builder: (yargs) => {
        const { installReadOptions } = require('../../lib/handlers/file')

        installReadOptions(yargs)

        yargs.option('kind', {
            description: 'Summary kind',
            type: 'string',
            alias: ['k'],
            options: ['type', 'group'],
            default: 'type'
        })

        yargs.options('select', {
            alias: 's',
            type: 'string',
            describe: 'Select graph. Nodes will be added and linked only if graph contains at least one node.',
            default: ''
        })

        yargs.options('traverse', {
            alias: 'v',
            type: 'string',
            describe: 'Traverse graph. Nodes will be added and linked only if graph contains at least one node.',
            default: ''
        })

        yargs.option('summary-file-name', {
            description: 'Write summary to file',
            type: 'string',
            alias: ['summary-file']
        })

        yargs.option('summary-file-type', {
            description: 'Write summary to file with type',
            type: 'string',
            alias: ['summary-type'],
            options: ['summary', 'json'],
            default: 'summary'
        })
    },

    handler: async(argv) => {
        const { kind, select, traverse, summaryFile, summaryType } = argv

        const { recon } = require('../../lib/globals/recon')

        const { handleReadOptions } = require('../../lib/handlers/file')

        await handleReadOptions(argv, recon)

        const tree = {}

        let nodes

        switch (kind) {
            case 'group':
                nodes = recon.select('node[type="group"] > node')

                nodes.forEach((node) => {
                    const { label: group } = node.parent().data()
                    const { label } = node.data()

                    if (!tree.hasOwnProperty(group)) {
                        tree[group] = []
                    }

                    tree[group].push(label.replace(/\s+/g, ' ').trim())
                })

                break

            default:
                if (select) {
                    nodes = recon.select(select)
                }
                else
                if (traverse) {
                    nodes = recon.traverse(traverse)
                }
                else {
                    nodes = recon.select('node[type!="group"]')
                }

                nodes.forEach((node) => {
                    const { type, label } = node.data()

                    if (!tree.hasOwnProperty(type)) {
                        tree[type] = []
                    }

                    tree[type].push(label.replace(/\s+/g, ' ').trim())
                })

                break
        }

        console.table(tree)

        if (summaryFile) {
            const { writeFile } = require('@pown/file/lib/file')

            let data

            switch (summaryType) {
                case 'json':
                    data = JSON.stringify(tree)

                    break

                default:
                    const lines = []

                    Object.entries(tree).forEach(([name, values]) => {
                        lines.push(`${name}: ${values.length} ${values.slice(0, 5).join(', ')}${values.length > 5 ? '...' : ''}`)
                    })

                    data = lines.join('\n') + '\n'

                    break
            }

            await writeFile(summaryFile, data)
        }
    }
}
