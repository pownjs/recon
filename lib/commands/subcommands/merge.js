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
        const { readFile } = require('@pown/file/lib/file')

        const { Scout } = require('./scout')

        const scout = new Scout()

        scout.on('info', console.info.bind(console))
        scout.on('warn', console.warn.bind(console))
        scout.on('error', console.error.bind(console))

        const { fileA, fileB, subset } = argv

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

        try {
            scoutB.deserialize(fileBJSON)
        }
        catch (e) {
            console.error(`Cannot load file ${fileB}`)

            return
        }

        const {
            [subset]: collection
        } = scoutA.collectionNodes.diff(scoutB.collectionNodes)

        const nodes = collection.map(node => node.data())

        const { handleOutputOptions } = require('./options/output')

        await handleOutputOptions(argv, nodes)

        const { handleWriteOptions } = require('./options/file')

        scout.addCollection(collection)

        await handleWriteOptions(argv, scout)
    }
}
