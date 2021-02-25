exports.yargs = {
    command: 'add <uris...>',
    describe: 'Add remote',
    aliases: ['a'],

    handler: async(argv) => {
        const { uris } = argv

        const { getPreferences, setPreferences } = require('@pown/preferences')

        const { fetchRemoteTransforms } = require('../../../../lib/remote')

        const preferences = await getPreferences('recon')

        preferences.remotes = {
            ...preferences.remotes,

            ...Object.assign({}, ...(await Promise.all(uris.map(async(uri) => {
                const transforms = await fetchRemoteTransforms(uri)

                console.group(uri)

                Object.entries(transforms).forEach(([name, def]) => {
                    console.table([{ ...def, name }], ['name', 'title', 'description'])
                })

                console.groupEnd()

                return {
                    [uri]: transforms
                }
            }))))
        }

        await setPreferences('recon', preferences)
    }
}
