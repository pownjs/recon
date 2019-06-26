exports.yargs = {
    command: 'diff <fileA> <fileB>',
    describe: 'Perform a diff between two recon files',
    aliases: ['d'],

    builder: (yargs) => {
        yargs.option('subset', {
            alias: 's',
            choices: ['left', 'right', 'both'],
            default: 'left',
            describe: 'The subset to select'
        })

        const { installWriteOptions } = require('./handlers/file')

        installWriteOptions(yargs)

        const { installOutputOptions } = require('./handlers/output')

        installOutputOptions(yargs)
    },

    handler: async(argv) => {
        const { fileA, fileB, subset } = argv

        const { readFile } = require('@pown/file/lib/file')

        const { Recon } = require('../../recon')

        let fileAData

        try {
            fileAData = await readFile(fileA)
        }
        catch (e) {
            console.error(`Cannot read file ${fileA}`)

            return
        }

        let fileAJSON

        try {
            fileAJSON = JSON.parse(fileAData.toString())
        }
        catch (e) {
            console.error(`Cannot unpack file ${fileA}`)

            return
        }

        const reconA = new Recon()

        reconA.on('info', console.info.bind(console))
        reconA.on('warn', console.warn.bind(console))
        reconA.on('error', console.error.bind(console))
        reconA.on('debug', console.debug.bind(console))

        try {
            reconA.deserialize(fileAJSON)
        }
        catch (e) {
            console.error(`Cannot load file ${fileA}`)

            return
        }

        let fileBData

        try {
            fileBData = await readFile(fileB)
        }
        catch (e) {
            console.error(`Cannot read file ${fileB}`)

            return
        }

        let fileBJSON

        try {
            fileBJSON = JSON.parse(fileBData.toString())
        }
        catch (e) {
            console.error(`Cannot parse file ${fileB}`)

            return
        }

        const reconB = new Recon()

        reconB.on('info', console.info.bind(console))
        reconB.on('warn', console.warn.bind(console))
        reconB.on('error', console.error.bind(console))
        reconB.on('debug', console.debug.bind(console))

        try {
            reconB.deserialize(fileBJSON)
        }
        catch (e) {
            console.error(`Cannot load file ${fileB}`)

            return
        }

        const {
            [subset]: collection
        } = reconA.cy.nodes().diff(reconB.cy.nodes())

        const resultNodes = collection.map(node => node.data())

        const { handleWriteOptions } = require('./handlers/file')

        const recon = new Recon()

        recon.on('info', console.info.bind(console))
        recon.on('warn', console.warn.bind(console))
        recon.on('error', console.error.bind(console))
        recon.on('debug', console.debug.bind(console))

        recon.cy.add(collection)

        await handleWriteOptions(argv, recon)

        const { handleOutputOptions } = require('./handlers/output')

        await handleOutputOptions(argv, resultNodes)

    }
}
