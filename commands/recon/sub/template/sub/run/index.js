exports.yargs = {
    command: 'run <templates...>',
    describe: 'Run template',
    aliases: ['r'],

    builder: (yargs) => {
        const { installReadOptions, installWriteOptions } = require('../../../../lib/handlers/file')

        installReadOptions(yargs)
        installWriteOptions(yargs)

        const { installOutputOptions } = require('../../../../lib/handlers/output')

        installOutputOptions(yargs)
    },

    handler: async(argv) => {
        const { templates } = argv

        const { recon: gRecon } = require('../../../../lib/globals/recon')

        const { getCompoundTransforms } = require('../../../transform/transforms')

        const compoundTransforms = getCompoundTransforms()

        gRecon.registerTransforms(compoundTransforms)

        const { handleReadOptions, handleWriteOptions } = require('../../../../lib/handlers/file')

        await handleReadOptions(argv, gRecon)

        const jsYaml = require('js-yaml')

        const { extname, join } = require('path')
        const { statSync, readdirSync, readFileSync } = require('fs')

        const { ReconTemplate, ReconTemplateSet } = require('./recon')

        const findTemplates = function*(paths) {
            for (let path of paths) {
                const stat = statSync(path)

                if (stat.isDirectory()) {
                    for (let dir of readdirSync(path)) {
                        yield* findTemplates([join(path, dir)])
                    }
                }
                else {
                    const ext = extname(path)

                    let doc

                    if (['.yaml', '.yml'].includes(ext)) {
                        const data = readFileSync(path)

                        doc = jsYaml.load(data)
                    }
                    else
                    if (['.json'].includes(ext)) {
                        const data = readFileSync(path)

                        doc = JSON.parse(data)
                    }
                    else {
                        return
                    }

                    yield new ReconTemplate(doc)
                }
            }
        }

        const templateSet = new ReconTemplateSet(Array.from(findTemplates(templates)))

        const results = await templateSet.run(gRecon)

        const generateResult = function*(results) {
            if (!results) {
                return
            }
            else
            if (Array.isArray(results)) {
                for (let result of results) {
                    yield* generateResult(result)
                }
            }
            else {
                if (results.id) {
                    yield results
                }
                else {
                    yield* generateResult(Object.values(results))
                }
            }
        }

        const resultNodes = Array.from(generateResult(results))

        await handleWriteOptions(argv, gRecon)

        const { handleOutputOptions } = require('../../../../lib/handlers/output')

        await handleOutputOptions(argv, resultNodes)
    }
}
