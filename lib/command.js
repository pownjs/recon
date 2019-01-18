exports.yargs = {
    command: 'recon <subcommand>',
    describe: 'Target recon',

    builder: (yargs) => {
        yargs = yargs.command(require('./subcommands/transform').yargs)
    }
}
