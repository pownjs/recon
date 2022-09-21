const { extractSync } = require('@pown/modules')
const { getPreferencesSync } = require('@pown/preferences')

const { buildRemoteTransforms } = require('../../../../lib/remote')

const getCompoundTransforms = async () => {
    const { remotes = {} } = getPreferencesSync('recon')

    const remoteTransforms = buildRemoteTransforms(remotes)

    const { loadableTransforms } = extractSync()

    return {
        ...remoteTransforms,

        ...Object.assign({}, ...(await Promise.all(loadableTransforms.map(async (module) => {
            let transforms

            try {
                transforms = require(module)
            }
            catch (e) {
                if (e.code === 'ERR_REQUIRE_ESM' || e.message === 'Cannot use import statement outside a module') {
                    return await import(module)
                }

                return {}
            }

            if (!transforms) {
                return {}
            }

            return Object.assign({}, ...Object.entries(transforms).map(([name, Transform]) => {
                return {
                    [name]: class extends Transform {
                        static loadableTransformModule = module;
                        static loadableTransformName = name;
                    }
                }
            }))
        }))))
    }
}

module.exports = { getCompoundTransforms }
