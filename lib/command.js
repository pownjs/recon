exports.yargs = {
    command: 'recon [options] <command>',
    describe: 'Target recon',

    builder: (yargs) => {
        yargs = yargs.command(require('./subcommands/transform').yargs)
    }
}
