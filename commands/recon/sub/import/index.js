exports.yargs = {
    command: 'import <file>',
    describe: 'Import file',
    aliases: ['i'],

    builder: (yargs) => {
        yargs.option('file-type', {
            choices: ['json'],
            describe: 'Import file type'
        })

        yargs.option('node-type', {
            describe: 'Imported nodes types',
            default: 'string'
        })

        yargs.option('id-field', {
            alias: 'i',
            describe: 'The id field'
        })

        yargs.option('type-field', {
            alias: 'i',
            describe: 'The type field'
        })

        yargs.option('label-field', {
            alias: 'l',
            describe: 'The label field'
        })

        yargs.option('image-field', {
            alias: 'm',
            describe: 'The image field'
        })

        yargs.options('group', {
            alias: 'g',
            type: 'string',
            describe: 'Group nodes',
            default: ''
        })

        const { installOutputOptions } = require('../../lib/handlers/output')

        installOutputOptions(yargs)
    },

    handler: async(argv) => {
        const { fileType: _fileType, nodeType, idField, typeField, labelField, imageField, group, file } = argv

        const path = require('path')

        const fileType = _fileType ? _fileType : path.extname(file).slice(1)

        const { recon } = require('../../lib/globals/recon')

        const nodes = []

        await new Promise((resolve, reject) => {
            const fs = require('fs')
            const { chain } = require('stream-chain')
            const { parser } = require('stream-csv-as-json')
            const { asObjects } = require('stream-csv-as-json/AsObjects')
            const StreamValues = require('stream-json/streamers/StreamValues')
            const { streamValues } = require('stream-json/streamers/StreamValues')

            let pipeline

            switch (fileType) {
                case 'csv':
                    pipeline = chain([
                        fs.createReadStream(file),
                        parser(),
                        asObjects(),
                        streamValues()
                    ])

                    break

                case 'json':
                default:
                    pipeline = chain([
                        fs.createReadStream(file),
                        StreamValues.withParser()
                    ])
            }

            pipeline.on('data', ({ value }) => {
                const item = {
                    props: value
                }

                if (nodeType) {
                    item.type = nodeType
                }

                if (idField) {
                    item.id = value[idField]
                }

                if (typeField) {
                    item.typeField = value[typeField]
                }

                if (labelField) {
                    item.label = value[labelField]
                }

                if (imageField) {
                    item.image = value[imageField]
                }

                nodes.push(item)
            })

            pipeline.on('error', (error) => {
                reject(error)
            })

            pipeline.on('end', () => {
                resolve()
            })
        })

        const resultNodes = (await recon.addNodes(nodes)).map(node => node.data())

        const { handleOutputOptions } = require('../../lib/handlers/output')

        await handleOutputOptions(argv, resultNodes)
    }
}
