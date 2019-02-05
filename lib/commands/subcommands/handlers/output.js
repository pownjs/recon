const installOutputOptions = (yargs) => {
    yargs.options('output-format', {
        description: 'Output format',
        alias: 'o',
        type: 'string',
        default: 'table',
        choices: ['table', 'grid', 'csv', 'json']
    })

    yargs.options('output-fields', {
        description: 'Output fields',
        type: 'string',
        default: ''
    })

    yargs.options('output-ids', {
        description: 'Output ids',
        type: 'boolean',
        default: false
    })

    yargs.options('output-labels', {
        description: 'Output labels',
        type: 'boolean',
        default: false
    })

    yargs.options('output-images', {
        description: 'Output images',
        type: 'boolean',
        default: false
    })

    yargs.options('output-parents', {
        description: 'Output parents',
        type: 'boolean',
        default: false
    })

    yargs.options('output-tags', {
        description: 'Output tags',
        type: 'boolean',
        default: false
    })
}

const handleOutputOptions = (argv, nodes) => {
    const { outputFormat, outputFields, outputIds, outputLabels, outputImages, outputParents, outputTags } = argv

    if (outputFormat === 'table') {
        const colors = require('@pown/cli/lib/colors')

        const tables = {}

        nodes.forEach(({ type, id, label, image, parent, props = {} }) => {
            const row = {}

            if (type === 'group') {
                row['label'] = label
            }

            if (outputIds) {
                row['id'] = id
            }

            if (outputLabels) {
                row['label'] = label
            }

            if (outputImages) {
                row['image'] = image
            }

            if (outputParents) {
                row['parent'] = parent
            }

            Object.entries(props).forEach(([name, value]) => {
                row[name] = value

                if (!outputLabels && outputTags && value === label) {
                    row[name] += ' ' + colors.bgBlue.white.bold('   label   ')
                }
            })

            let table = tables[type] || []

            table.push(row)

            tables[type] = table
        })

        if (outputFields) {
            Object.entries(tables).forEach(([type, table]) => {
                console.log(colors.bgRed.white.bold(`   ${type}   `))
                console.table(table, outputFields.split(',').map(f => f.trim()).filter(f => f))
            })
        }
        else {
            Object.entries(tables).forEach(([type, table]) => {
                console.log(colors.bgRed.white.bold(`   ${type}   `))
                console.table(table)
            })
        }
    }
    else
    if (outputFormat === 'grid') {
        const colors = require('@pown/cli/lib/colors')

        const table = []

        nodes.forEach(({ type, id, label, image, parent, props = {} }) => {
            const row = {}

            row['type'] = type

            if (type === 'group') {
                row['label'] = label
            }

            if (outputIds) {
                row['id'] = id
            }

            if (outputLabels) {
                row['label'] = label
            }

            if (outputImages) {
                row['image'] = image
            }

            if (outputParents) {
                row['parent'] = parent
            }

            Object.entries(props).forEach(([name, value]) => {
                row[name] = value

                if (!outputLabels && outputTags && value === label) {
                    row[name] += ' ' + colors.bgBlue.white.bold('   label   ')
                }
            })

            table.push(row)
        })

        if (outputFields) {
            console.table(table, outputFields.split(',').map(f => f.trim()).filter(f => f))
        }
        else {
            console.table(table)
        }
    }
    else
    if (outputFormat === 'csv') {
        const fields = {}
        const lines = []

        nodes.forEach(({ id, type, label, image, parent, props }) => {
            const line = {}

            fields['type'] = 1
            line['type'] = type

            if (type === 'group') {
                fields['label'] = 1
                line['label'] = label
            }

            if (outputIds) {
                fields['id'] = 1
                line['id'] = id
            }

            if (outputLabels) {
                fields['label'] = 1
                line['label'] = label
            }

            if (outputImages) {
                fields['image'] = 1
                line['image'] = image
            }

            if (outputParents) {
                fields['parent'] = 1
                line['parent'] = parent
            }

            Object.entries(props).forEach(([name, value]) => {
                fields[name] = 1
                line[name] = value
            })

            lines.push(line)
        })

        const fieldNames = Object.keys(fields)

        console.log('#' + fieldNames.join(','))

        lines.forEach((line) => {
            const fieldValues = fieldNames.map((name) => JSON.stringify(line[name] || ''))

            console.log(fieldValues.join(','))
        })
    }
    else
    if (outputFormat === 'json') {
        console.log('[');

        const lastIndex = nodes.length - 1

        nodes.forEach((node, index) => {
            console.log(JSON.stringify(node) + (index === lastIndex ? '' : ','))
        })

        console.log(']');
    }
}

module.exports = { installOutputOptions, handleOutputOptions }
