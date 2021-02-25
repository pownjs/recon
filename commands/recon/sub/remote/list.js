exports.yargs = {
    command: 'list',
    describe: 'List remotes',
    aliases: ['l'],

    handler: async(argv) => {
        const { getPreferences } = require('@pown/preferences')

        const { remotes = {} } = await getPreferences('recon')

        Object.entries(remotes).forEach(([uri, defs]) => {
            console.group(uri)

            Object.entries(defs).forEach(([name, def]) => {
                console.table([{ ...def, name }], ['name', 'title', 'description'])
            })

            console.groupEnd()
        })
    }
}
