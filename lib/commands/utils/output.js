const installOutputOptions = (yargs) => {
    yargs.options('output-format', {
        description: 'Output format',
        alias: 'o',
        type: 'string',
        default: 'table',
        choices: ['table', 'csv', 'json']
    })

    yargs.options('output-with-ids', {
        description: 'Output ids',
        type: 'boolean',
        default: false
    })
}

const handleOutputOptions = (argv, nodes, logger) => {
    const { outputFormat, outputWithIds } = argv

    if (outputFormat === 'table') {
        const fields = {}
        const lines = []

        nodes.forEach(({ id, type, props }) => {
            const line = {}

            if (outputWithIds) {
                fields['id'] = 1
                line['id'] = id
            }

            fields['type'] = 1
            line['type'] = type

            Object.entries(props).forEach(([name, value]) => {
                fields[name] = 1
                line[name] = value
            })

            lines.push(line)
        })

        const fieldNames = Object.keys(fields)

        const { Table } = require('@pown/cli/lib/table')

        const table = new Table({
            head: fieldNames
        })

        lines.forEach((line) => {
            const fieldValues = fieldNames.map((name) => line[name] || '')

            table.push(fieldValues)
        })

        logger.verbose(table.toString())
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

        logger.verbose('#' + fieldNames.join(','))

        lines.forEach((line) => {
            const fieldValues = fieldNames.map((name) => JSON.stringify(line[name] || ''))

            logger.verbose(fieldValues.join(','))
        })
    }
    else
    if (outputFormat === 'json') {
        logger.verbose('[');

        nodes.forEach(({ props }) => {
            logger.verbose(JSON.stringify(props))
        })

        logger.verbose(']');
    }
}

module.exports = { installOutputOptions, handleOutputOptions }
