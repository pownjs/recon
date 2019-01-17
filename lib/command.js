exports.yargs = {
    command: 'recon [options] <transformation>',
    describe: 'Target recon',

    builder: {
        'string': {
            alias: 's',
            type: 'array',
            description: 'String node'
        }
    },

    handler: async(argv) => {
        const { Logger } = require('@pown/cli/lib/logger')

        const { Scout } = require('./scout')

        const logger = new Logger(argv)

        const scout = new Scout()

        scout.registerModule('./transforms/github')

        scout.on('progress', (step, steps, status) => {
            logger.info(status)
        })

        const { string } = argv

        const nodes = []

        string.forEach((string) => {
            nodes.push({ id: Math.random().toString(32).slice(2), label: string })
        })

        let results

        try {
            results = await scout.transform(nodes, argv.transformation)
        }
        catch (e) {
            logger.error(e)
        }

        (results || []).forEach(({ props }) => {
            Object.entries(props).forEach(([name, value]) => {
                logger.verbose(name, value)
            })
        })
    }
}
