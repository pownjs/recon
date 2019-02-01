const installOutputOptions = (yargs) => {
    yargs.options('output-format', {
        description: 'Output format',
        alias: 'o',
        type: 'string',
        default: 'table',
        choices: ['table', 'csv', 'json']
    })

    yargs.options('output-fields', {
        description: 'Output fields',
        type: 'string',
        default: ''
    })

    yargs.options('output-with-ids', {
            description: 'Output ids',
            type: 'boolean',
            default: false
        }),

        yargs.options('output-with-labels', {
            description: 'Output labels',
            type: 'boolean',
            default: false
        })
}

const handleOutputOptions = (argv, nodes) => {
    const { outputFormat, outputFields, outputWithIds, outputWithLabels } = argv

    if (outputFormat === 'table') {
        const table = []

        nodes.forEach(({ type, id, label, props }) => {
            const row = {}

            row['type'] = type

            if (outputWithIds) {
                row['id'] = id
            }

            if (outputWithLabels) {
                row['label'] = label
            }

            Object.entries(props).forEach(([name, value]) => {
                row[name] = value
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

        nodes.forEach(({ id, type, props }) => {
            const line = {}

            if (outputWithIds) {
                fields['id'] = 1
                line['id'] = id
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

        nodes.forEach(({ props }) => {
            console.log(JSON.stringify(props))
        })

        console.log(']');
    }
}

module.exports = { installOutputOptions, handleOutputOptions }
