exports.yargs = {
    command: 'recon [options] <command>',
    describe: 'Target recon',

    builder: (yargs) => {
        yargs.command(require('./transform').yargs)
        yargs.command(require('./select').yargs)
        yargs.command(require('./diff').yargs)
    }
}
