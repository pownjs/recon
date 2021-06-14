exports.yargs = {
    command: 'get <name>',
    describe: 'Get named traversal',

    builder: (yargs) => {},

    handler: async(argv) => {
        const { name } = argv

        const { recon } = require('../../../lib/globals/recon')

        console.log(recon.cy.getTraversalByName(name))
    }
}
