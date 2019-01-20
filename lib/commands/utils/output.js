const installOutputOptions = (yargs) => {
    yargs.options('format', {
        description: 'Output format',
        alias: 'f',
        type: 'string',
        default: 'table',
        choices: ['table', 'json', 'csv']
    })
}

const handleOutputOptions = (argv, nodes, logger) => {
    const { format } = argv

    if (format === 'table') {
        const fields = {}
        const lines = []

        nodes.forEach(({ props }) => {
            const line = {}

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
    if (format === 'json') {
        logger.verbose('[');

        nodes.forEach(({ props }) => {
            logger.verbose(JSON.stringify(props))
        })

        logger.verbose(']');
    }
    else
    if (format === 'csv') {
        const fields = {}
        const lines = []

        nodes.forEach(({ props }) => {
            const line = {}

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
}

module.exports = { installOutputOptions, handleOutputOptions }
