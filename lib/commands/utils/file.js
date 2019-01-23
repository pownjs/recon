const installReadOptions = (yargs) => {
    yargs.option('read', {
        alias: 'r',
        type: 'string',
        description: 'Read file'
    })
}

const installWriteOptions = (yargs) => {
    yargs.option('write', {
        alias: 'w',
        type: 'string',
        description: 'Write file'
    })
}

const handleReadOptions = async(argv, scout) => {
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
        console.error(`Cannot read file ${read}`)

        return
    }

    let json

    try {
        json = JSON.parse(data.toString())
    }
    catch (e) {
        console.error(`Cannot deserialize scout data`)

        return
    }

    try {
        scout.load(json)
    }
    catch (e) {
        console.error(`Cannot load scout data`)
    }
}

const handleWriteOptions = async(argv, scout) => {
    const { write, append } = argv

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
        console.error(`Cannot save scout data`)

        return
    }

    let data

    try {
        data = JSON.stringify(json)
    }
    catch (e) {
        console.error(`Cannot serialize scout data`)

        return
    }

    if (data) {
        try {
            await writeFile(write, data)
        }
        catch (e) {
            console.error(`Cannot write file ${write}`)

            return
        }
    }
}

module.exports = { installReadOptions, installWriteOptions, handleReadOptions, handleWriteOptions }
