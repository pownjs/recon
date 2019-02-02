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

        const { installWriteOptions } = require('./options/file')

        installWriteOptions(yargs)

        const { installOutputOptions } = require('./options/output')

        installOutputOptions(yargs)
    },

    handler: async(argv) => {
        const { fileA, fileB, subset } = argv

        const { readFile } = require('@pown/file/lib/file')

        const { Scout } = require('../../scout')

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

        const scoutA = new Scout()

        scoutA.on('info', console.info.bind(console))
        scoutA.on('warn', console.warn.bind(console))
        scoutA.on('error', console.error.bind(console))

        try {
            scoutA.deserialize(fileAJSON)
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

        const scoutB = new Scout()

        scoutB.on('info', console.info.bind(console))
        scoutB.on('warn', console.warn.bind(console))
        scoutB.on('error', console.error.bind(console))

        try {
            scoutB.deserialize(fileBJSON)
        }
        catch (e) {
            console.error(`Cannot load file ${fileB}`)

            return
        }

        const {
            [subset]: collection
        } = scoutA.cy.nodes().diff(scoutB.cy.nodes())

        const nodes = collection.map(node => node.data())

        const { handleOutputOptions } = require('./options/output')

        await handleOutputOptions(argv, nodes)

        const { handleWriteOptions } = require('./options/file')

        const scout = new Scout()

        scout.on('info', console.info.bind(console))
        scout.on('warn', console.warn.bind(console))
        scout.on('error', console.error.bind(console))

        scout.cy.add(collection)

        await handleWriteOptions(argv, scout)
    }
}
