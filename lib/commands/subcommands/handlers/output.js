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
        })

    yargs.options('output-with-labels', {
        description: 'Output labels',
        type: 'boolean',
        default: false
    })

    yargs.options('output-with-parents', {
        description: 'Output parents',
        type: 'boolean',
        default: false
    })
}

const handleOutputOptions = (argv, nodes) => {
    const { outputFormat, outputFields, outputWithIds, outputWithLabels, outputWithParents } = argv

    if (outputFormat === 'table') {
        const table = []

        nodes.forEach(({ type, id, label, parent, props = {} }) => {
            const row = {}

            row['type'] = type

            if (outputWithIds) {
                row['id'] = id
            }

            if (outputWithLabels) {
                row['label'] = label
            }

            if (outputWithParents) {
                row['parent'] = parent
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

            if (outputWithLabels) {
                fields['label'] = 1
                line['label'] = label
            }

            if (outputWithParents) {
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

        nodes.forEach(({ props }, index) => {
            console.log(JSON.stringify(props) + (index === lastIndex ? '' : ','))
        })

        console.log(']');
    }
}

module.exports = { installOutputOptions, handleOutputOptions }
