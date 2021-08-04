exports.yargs = {
    command: 'summary [options]',
    describe: 'Create a summary',
    aliases: ['y'],

    builder: (yargs) => {
        const { installReadOptions } = require('../../lib/handlers/file')

        installReadOptions(yargs)

        yargs.option('kind', {
            description: 'Summary kind',
            type: 'string',
            alias: ['k'],
            default: 'type',
            options: ['type', 'group']
        })

        yargs.option('select', {
            alias: 's',
            type: 'string',
            describe: 'Select graph. Nodes will be added and linked only if graph contains at least one node',
            default: ''
        })

        yargs.option('traverse', {
            alias: 'v',
            type: 'string',
            describe: 'Traverse graph. Nodes will be added and linked only if graph contains at least one node',
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
            default: 'summary',
            options: ['summary', 'json']
        })

        yargs.option('sample-size', {
            description: 'The summary sample size',
            type: 'number',
            alias: ['size'],
            default: 10
        })

        yargs.option('sample-title', {
            description: 'The summary sample title',
            type: 'string',
            alias: ['title'],
            default: ''
        })

        yargs.option('expand-types', {
            description: 'Expand types',
            type: 'array',
            alias: ['expand', 'expand-type'],
            default: []
        })

        yargs.option('highlights-title', {
            description: 'Print highlights title',
            type: 'string',
            alias: ['highlight-title'],
            default: ''
        })

        yargs.option('highlights-select', {
            description: 'Select highlights',
            type: 'string',
            alias: ['highlight-select'],
            default: ''
        })

        yargs.option('highlights-traverse', {
            description: 'Traverse highlights',
            type: 'string',
            alias: ['highlight-traverse'],
            default: ''
        })

        yargs.option('highlights-sort-field', {
            description: 'Sort highlights by field',
            type: 'string',
            alias: ['highlight-sort-field'],
            default: ''
        })

        yargs.option('highlights-max-size', {
            description: 'Max size for the highlights',
            type: 'number',
            alias: ['highlight-max-size'],
            default: Infinity
        })
    },

    handler: async(argv) => {
        const { kind, select, traverse, summaryFile, summaryType, sampleSize, sampleTitle, expandTypes, highlightsTitle, highlightsSelect, highlightsTraverse, highlightsSortField, highlightsMaxSize } = argv

        const { recon } = require('../../lib/globals/recon')

        const { handleReadOptions } = require('../../lib/handlers/file')

        await handleReadOptions(argv, recon)

        const tree = {}

        let nodes

        switch (kind) {
            case 'group':
                nodes = recon.select('node[type="group"] > node')

                nodes.forEach((node) => {
                    const { label: group = '' } = node.parent().data()
                    const { label = '' } = node.data()

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
                    const { type = '', label = '' } = node.data()

                    if (!tree.hasOwnProperty(type)) {
                        tree[type] = []
                    }

                    tree[type].push(label.replace(/\s+/g, ' ').trim())
                })

                break
        }

        Object.entries(tree).forEach(([name, value]) => {
            tree[name] = {
                total: value.length,
                sample: value.slice(0, sampleSize)
            }
        })

        console.table(Object.entries(tree).map(([kind, { total, sample }]) => {
            return { kind, total, sample }
        }))

        if (summaryFile) {
            const { writeFile } = require('@pown/file/lib/writeFile') // TODO: remove and use fs instead

            let data

            switch (summaryType) {
                case 'json':
                    data = JSON.stringify(tree)

                    break

                default:
                    const lines = []

                    let highlightsCollection

                    if (highlightsSelect) {
                        highlightsCollection = recon.cy.filter(highlightsSelect)
                    }
                    else
                    if (highlightsTraverse) {
                        highlightsCollection = recon.cy.traverse(highlightsTraverse)
                    }
                    else {
                        highlightsCollection = recon.cy.collection()
                    }

                    if (highlightsSortField) {
                        highlightsCollection = highlightsCollection.sort((nodeA, nodeB) => {
                            return nodeB.data('props')[highlightsSortField] - nodeA.data('props')[highlightsSortField] // TODO: make it more generic by using . notation
                        })
                    }

                    highlightsCollection = Array.from(new Set(highlightsCollection.map(node => node.data('label')))).slice(0, highlightsMaxSize)

                    if (highlightsCollection.length) {
                        if (highlightsTitle) {
                            lines.push(`${highlightsTitle}\n`)
                        }

                        highlightsCollection.forEach((label) => {
                            lines.push(`${label}`)
                        })

                        lines.push('')
                    }

                    for (let i = 0; i < expandTypes.length; i++) {
                        expandTypes[i] = expandTypes[0].split(/,/g).map(i => i.trim()).filter(i => i)
                    }

                    const allItems = Object.entries(tree)
                    const expandItems = allItems.filter(([kind]) => expandTypes.some(et => et.includes(kind)))
                    const filteredItems = allItems.filter(([kind]) => expandTypes.every(et => !et.includes(kind)))

                    if (expandItems.length) {
                        expandItems.forEach(([kind, { sample }]) => {
                            lines.push(`${kind.replace(/^(\w)/, (g) => g.toUpperCase())}s\n`)

                            sample.forEach((item) => {
                                lines.push(`${item}`)
                            })

                            lines.push('')
                        })
                    }

                    if (filteredItems.length) {
                        if (sampleTitle) {
                            lines.push(`${sampleTitle}\n`)
                        }

                        filteredItems.forEach(([kind, { total, sample }]) => {
                            lines.push(`${kind} (${total}): ${sample.join(', ')}${total > sample.length ? '...' : ''}`)
                        })
                    }

                    data = lines.join('\n') + '\n'

                    break
            }

            await writeFile(summaryFile, data)
        }
    }
}
