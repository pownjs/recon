const { extractSync } = require('@pown/modules')
const { getPreferencesSync } = require('@pown/preferences')

const { buildRemoteTransforms } = require('../../../../lib/remote')

const getCompoundTransforms = () => {
    const { remotes = {} } = getPreferencesSync('recon')

    const remoteTransforms = buildRemoteTransforms(remotes)

    const { loadableTransforms } = extractSync()

    return {
        ...remoteTransforms,

        ...Object.assign({}, ...loadableTransforms.map((m) => {
            let transforms

            try {
                transforms = require(m)
            }
            catch (e) {
                console.error(e)

                return {}
            }

            if (!transforms) {
                return {}
            }

            return transforms
        }))
    }
}

module.exports = { getCompoundTransforms }
