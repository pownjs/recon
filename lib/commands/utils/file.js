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

    const { readFile } = require('@pown/file/lib/file')

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
        scout.deserialize(json)
    }
    catch (e) {
        console.error(`Cannot load scout data`)
    }
}

const handleWriteOptions = async(argv, scout) => {
    const { write } = argv

    if (!write) {
        return
    }

    const { writeFile } = require('@pown/file/lib/file')

    let json

    try {
        json = scout.serialize()
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
