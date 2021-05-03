const installOutputOptions = (yargs) => {
    yargs.options('output-format', {
        description: 'Output format',
        alias: 'o',
        type: 'string',
        default: 'table',
        choices: ['table', 'grid', 'csv', 'json', 'jsonstream', 'none']
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

    yargs.options('output-fields', {
        description: 'Output fields',
        type: 'string',
        default: ''
    })

    yargs.options('max-output-size', {
        description: 'Maximum amount of nodes to output',
        type: 'number',
        default: Infinity
    })
}

const handleOutputOptions = (argv, nodes) => {
    const { outputFormat, outputIds, outputLabels, outputFields, maxOutputSize } = argv

    let propsFilter

    if (outputFields) {
        const fields = outputFields.split(/[\s,]+/g).map(f => f.trim()).filter(f => f)

        propsFilter = (props) => Object.entries(props).filter(([key]) => fields.includes(key)).slice(0, 5)
    }
    else {
        propsFilter = (props) => Object.entries(props).slice(0, 5)
    }

    switch (outputFormat) {
        case 'table':
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

                propsFilter(props).forEach(([name, value]) => {
                    row[name] = value
                })

                let table = tables[type] || []

                table.push(row)

                tables[type] = table
            })

            Object.entries(tables).forEach(([type, table]) => {
                console.group(type)
                console.table(table.slice(0, maxOutputSize))
                console.groupEnd()
            })

            break

        case 'grid':
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

                propsFilter(props).forEach(([name, value]) => {
                    row[name] = value
                })

                table.push(row)
            })

            console.table(table.slice(0, maxOutputSize))

            break

        case 'csv':
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

                propsFilter(props).forEach(([name, value]) => {
                    fields[name] = 1
                    line[name] = value
                })

                lines.push(line)
            })

            const fieldNames = Object.keys(fields)

            console.log('#' + fieldNames.join(','))

            lines.slice(0, maxOutputSize).forEach((line) => {
                const fieldValues = fieldNames.map((name) => JSON.stringify(line[name] || ''))

                console.log(fieldValues.join(','))
            })

            break

        case 'json':
            console.log('[');

            const lastIndex = nodes.length - 1

            nodes.slice(0, maxOutputSize).forEach((node, index) => {
                try {
                    console.log('  ', JSON.stringify(node) + (index === lastIndex ? '' : ','))
                }
                catch (e) {
                    console.error(e)
                }
            })

            console.log(']');

            break

        case 'jsonstream':
            nodes.slice(0, maxOutputSize).forEach((node) => {
                try {
                    console.log(JSON.stringify(node))
                }
                catch (e) {
                    console.error(e)
                }
            })

            break
    }
}

module.exports = { installOutputOptions, handleOutputOptions }
