exports.yargs = {
    command: 'list',
    describe: 'List remotes',
    aliases: ['l'],

    handler: async(argv) => {
        const colors = require('@pown/cli/lib/colors')
        const { getPreferences } = require('@pown/preferences')

        const { remotes = {} } = await getPreferences('recon')

        Object.entries(remotes).forEach(([uri, defs]) => {
            console.log(colors.bgRed.white.bold(`   ${uri}   `))

            Object.entries(defs).forEach(([name, def]) => {
                console.table([{ ...def, name }], ['name', 'title', 'description'])
            })
        })
    }
}
