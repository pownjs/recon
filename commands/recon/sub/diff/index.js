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

        const { installWriteOptions } = require('../../lib/handlers/file')

        installWriteOptions(yargs)

        const { installOutputOptions } = require('../../lib/handlers/output')

        installOutputOptions(yargs)
    },

    handler: async(argv) => {
        const { fileA, fileB, subset } = argv

        const { readFile } = require('@pown/file/lib/readFile') // TODO: remove and use fs instead

        const { Recon } = require('../../../../lib/recon')

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
            fileAJSON = JSON.parse(fileAData, (key, value) => {
                if (value && value.type === 'Buffer' && Array.isArray(value.data)) {
                    return Buffer.from(value.data)
                }
                else {
                    return value
                }
            })
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
            fileBJSON = JSON.parse(fileBData, (key, value) => {
                if (value && value.type === 'Buffer' && Array.isArray(value.data)) {
                    return Buffer.from(value.data)
                }
                else {
                    return value
                }
            })
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
        } = reconA.cy.elements().diff(reconB.cy.elements())

        const resultNodes = collection.map(node => node.data())

        const { handleWriteOptions } = require('../../lib/handlers/file')

        const recon = new Recon()

        recon.on('info', console.info.bind(console))
        recon.on('warn', console.warn.bind(console))
        recon.on('error', console.error.bind(console))
        recon.on('debug', console.debug.bind(console))

        recon.cy.add({
            group: 'nodes',
            data: {
                id: 'previous',
                type: 'previous',
                label: 'Previous',
                props: {}
            }
        })

        collection.nodes().forEach((node) => {
            recon.cy.add(node)
        })

        collection.edges().forEach((edge) => {
            const data = edge.data()

            let { source, target } = data

            let move

            if (!source || !collection.getElementById(source).length) {
                source = 'previous'
                move = true
            }

            if (!target || !collection.getElementById(target).length) {
                target = 'previous'
                move = true
            }

            if (move) {
                recon.cy.add({
                    group: 'edges',
                    data: { ...data, source, target }
                })
            }
            else {
                recon.cy.add({
                    group: 'edges',
                    data: data
                })
            }
        })

        await handleWriteOptions(argv, recon)

        const { handleOutputOptions } = require('../../lib/handlers/output')

        await handleOutputOptions(argv, resultNodes)

    }
}
