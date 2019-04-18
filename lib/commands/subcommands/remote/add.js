exports.yargs = {
    command: 'add <uri>',
    describe: 'Add remote',
    aliases: ['a'],

    handler: async(argv) => {
        const { uri } = argv

        const colors = require('@pown/cli/lib/colors')
        const { getPreferences, setPreferences } = require('@pown/preferences')

        const { fetchRemoteTransforms } = require('../../../remote')

        const transforms = await fetchRemoteTransforms(uri)

        console.log(colors.bgRed.white.bold(`   ${uri}   `))

        Object.entries(transforms).forEach(([name, def]) => {
            console.table([{ ...def, name }], ['name', 'title', 'description'])
        })

        const preferences = await getPreferences('recon')

        preferences.remotes = {
            ...preferences.remotes,

            [uri]: transforms
        }

        setPreferences('recon', preferences)
    }
}
