exports.yargs = {
    command: 'add <uris...>',
    describe: 'Add remote',
    aliases: ['a'],

    handler: async(argv) => {
        const { uris } = argv

        const colors = require('@pown/cli/lib/colors')
        const { getPreferences, setPreferences } = require('@pown/preferences')

        const { fetchRemoteTransforms } = require('../../../remote')

        const preferences = await getPreferences('recon')

        preferences.remotes = {
            ...preferences.remotes,

            ...Object.assign({}, ...(await Promise.all(uris.map(async(uri) => {
                const transforms = await fetchRemoteTransforms(uri)

                console.log(colors.bgRed.white.bold(`   ${uri}   `))

                Object.entries(transforms).forEach(([name, def]) => {
                    console.table([{ ...def, name }], ['name', 'title', 'description'])
                })

                return {
                    [uri]: transforms
                }
            }))))
        }

        setPreferences('recon', preferences)
    }
}
