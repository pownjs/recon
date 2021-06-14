exports.yargs = {
    command: 'traverse <expressions...>',
    describe: 'Traverse nodes',
    aliases: ['v'],

    builder: (yargs) => {
        yargs.command(require('./sub/traverse').yargs)
        yargs.command(require('./sub/set').yargs)
        yargs.command(require('./sub/get').yargs)
        yargs.command(require('./sub/del').yargs)
    }
}
