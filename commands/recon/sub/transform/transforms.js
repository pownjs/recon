const { extractSync } = require('@pown/modules')
const { getPreferencesSync } = require('@pown/preferences')

const transforms = require('../../../../lib/transforms')
const { buildRemoteTransforms } = require('../../../../lib/remote')

const getCompoundTransforms = () => {
    const { remotes = {} } = getPreferencesSync('recon')

    const remoteTransforms = buildRemoteTransforms(remotes)

    const { loadableTransforms } = extractSync()

    return {
        ...remoteTransforms,
        ...transforms,

        ...Object.assign({}, ...loadableTransforms.map((m) => {
            try {
                return require(m)
            }
            catch (e) {
                console.error(e)
            }
        }))
    }
}

module.exports = { getCompoundTransforms }
