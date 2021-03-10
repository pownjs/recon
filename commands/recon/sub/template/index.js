exports.yargs = {
    command: 'template <command>',
    describe: 'Recon template commands',
    aliases: ['p'],

    builder: (yargs) => {
        yargs.command(require('./sub/run').yargs)
    }
}
