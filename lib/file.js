const installReadOptions = (yargs) => {
    yargs.option('read', {
        alias: 'r',
        description: 'Read file'
    })
}

const installWriteOptions = (yargs) => {
    yargs.option('write', {
        alias: 'w',
        description: 'Write file'
    })
}

const handleReadOptions = async(argv, scout, logger) => {
    const { read } = argv

    if (!read) {
        return
    }

    const fs = require('fs')
    const util = require('util')

    const readFile = util.promisify(fs.readFile.bind(fs))

    let data

    try {
        data = await readFile(read)
    }
    catch (e) {
        logger.error(`Cannot read file ${read}`)

        return
    }

    let json

    try {
        json = JSON.parse(data.toString())
    }
    catch (e) {
        logger.error(`Cannot deserialize scout data`)

        return
    }

    try {
        scout.load(json)
    }
    catch (e) {
        logger.error(`Cannot load scout data`)
    }
}

const handleWriteOptions = async(argv, scout, logger) => {
    const { write } = argv

    if (!write) {
        return
    }

    const fs = require('fs')
    const util = require('util')

    const writeFile = util.promisify(fs.writeFile.bind(fs))

    let json

    try {
        json = scout.save()
    }
    catch (e) {
        logger.error(`Cannot save scout data`)

        return
    }

    let data

    try {
        data = JSON.stringify(json)
    }
    catch (e) {
        logger.error(`Cannot serialize scout data`)

        return
    }

    if (data) {
        try {
            await writeFile(write, data)
        }
        catch (e) {
            logger.error(`Cannot write file ${write}`)

            return
        }
    }
}

module.exports = { installReadOptions, installWriteOptions, handleReadOptions, handleWriteOptions }
