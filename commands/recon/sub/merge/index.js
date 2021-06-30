exports.yargs = {
    command: 'merge <files...>',
    describe: 'Perform a merge between at least two recon files',
    aliases: ['m'],

    builder: (yargs) => {
        const { installWriteOptions } = require('../../lib/handlers/file')

        installWriteOptions(yargs)
    },

    handler: async(argv) => {
        const { files } = argv

        const { readFile } = require('@pown/file/lib/readFile') // TODO: remove and use fs instead

        const { Recon } = require('../../../../lib/recon')

        const recon = new Recon()

        recon.on('info', console.info.bind(console))
        recon.on('warn', console.warn.bind(console))
        recon.on('error', console.error.bind(console))
        recon.on('debug', console.debug.bind(console))

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
                json = JSON.parse(data, (key, value) => {
                    if (value && value.type === 'Buffer' && Array.isArray(value.data)) {
                        return Buffer.from(value.data)
                    }
                    else {
                        return value
                    }
                })
            }
            catch (e) {
                console.error(`Cannot unpack file ${file}`)

                return
            }

            const reconFile = new Recon()

            reconFile.on('info', console.info.bind(console))
            reconFile.on('warn', console.warn.bind(console))
            reconFile.on('error', console.error.bind(console))
            reconFile.on('debug', console.debug.bind(console))

            try {
                reconFile.deserialize(json)
            }
            catch (e) {
                console.error(`Cannot load file ${file}`)

                return
            }

            recon.cy.add(reconFile.cy.elements())
        }))

        const { handleWriteOptions } = require('../../lib/handlers/file')

        await handleWriteOptions(argv, recon)
    }
}
