exports.yargs = {
    command: 'template <command>',
    describe: 'Recon template commands',
    aliases: ['p', 'templates'],

    builder: (yargs) => {
        yargs.command(require('./sub/run').yargs)
    }
}
