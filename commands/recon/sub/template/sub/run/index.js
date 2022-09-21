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

        const compoundTransforms = await getCompoundTransforms()

        gRecon.registerTransforms(compoundTransforms)

        const { handleReadOptions, handleWriteOptions } = require('../../../../lib/handlers/file')

        await handleReadOptions(argv, gRecon)

        const jsYaml = require('js-yaml')

        const { extname, join } = require('path')
        const { statSync, readdirSync, readFileSync } = require('fs')

        const { ReconTemplate } = require('../../../../../../lib/template')

        const { Scheduler } = require('../../../../../../lib/scheduler')

        const scheduler = new Scheduler()

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

                    const template = new ReconTemplate(doc, { scheduler })

                    template.path = path

                    yield template
                }
            }
        }

        const { handleOutputOptions } = require('../../../../lib/handlers/output')

        for (let template of findTemplates(templates)) {
            console.info(`running template ${template.id || template.path}`)

            await template.run({}, gRecon)

            const resultNodes = gRecon.selection.map(node => node.data())

            await handleOutputOptions(argv, resultNodes)
        }

        await handleWriteOptions(argv, gRecon)
    }
}
