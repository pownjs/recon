exports.yargs = {
    command: 'remove <uri>',
    describe: 'Remove remote',
    aliases: ['a'],

    handler: async(argv) => {
        const { uri } = argv

        const { getPreferences, setPreferences } = require('@pown/preferences')

        const preferences = await getPreferences('recon')

        delete preferences.remotes[uri]

        setPreferences('recon', preferences)
    }
}
