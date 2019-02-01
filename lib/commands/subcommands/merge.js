exports.yargs = {
    command: 'merge <files...>',
    describe: 'Perform a merge between at least two recon files',
    aliases: ['d'],

    builder: (yargs) => {
        const { installWriteOptions } = require('./options/file')

        installWriteOptions(yargs)
    },

    handler: async(argv) => {
        const { files } = argv

        const { readFile } = require('@pown/file/lib/file')

        const { Scout } = require('../../scout')

        const scout = new Scout()

        scout.on('info', console.info.bind(console))
        scout.on('warn', console.warn.bind(console))
        scout.on('error', console.error.bind(console))

        await Promise.all(files.map(async(file) => {
            let data

            try {
                data = await readFile(file)
            }
            catch (e) {
                console.error(`Cannot read file ${file}`)

                return
            }

            let json

            try {
                json = JSON.parse(data.toString())
            }
            catch (e) {
                console.error(`Cannot unpack file ${file}`)

                return
            }

            const scoutFile = new Scout()

            scoutFile.on('info', console.info.bind(console))
            scoutFile.on('warn', console.warn.bind(console))
            scoutFile.on('error', console.error.bind(console))

            try {
                scoutFile.deserialize(json)
            }
            catch (e) {
                console.error(`Cannot load file ${file}`)

                return
            }

            scout.cy.add(scoutFile.cy.elements())
        }))

        const { handleWriteOptions } = require('./options/file')

        await handleWriteOptions(argv, scout)
    }
}
