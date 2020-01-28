exports.yargs = {
    command: 'remove <uris...>',
    describe: 'Remove remote',
    aliases: ['a'],

    handler: async(argv) => {
        const { uris } = argv

        const { getPreferences, setPreferences } = require('@pown/preferences')

        const preferences = await getPreferences('recon')

        uris.forEach((uri) => {
            delete preferences.remotes[uri]
        })

        setPreferences('recon', preferences)
    }
}
