exports.yargs = {
    command: 'template <command>',
    describe: 'Recon template commands',

    builder: (yargs) => {
        yargs.command(require('./sub/run').yargs)
    }
}
