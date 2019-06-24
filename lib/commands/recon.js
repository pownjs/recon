exports.yargs = {
    command: 'recon <command>',
    describe: 'Target recon',

    builder: (yargs) => {
        yargs.command(require('./subcommands/transform').yargs)
        yargs.command(require('./subcommands/select').yargs)
        yargs.command(require('./subcommands/traverse').yargs)
        yargs.command(require('./subcommands/add').yargs)
        yargs.command(require('./subcommands/remove').yargs)
        yargs.command(require('./subcommands/merge').yargs)
        yargs.command(require('./subcommands/diff').yargs)
        yargs.command(require('./subcommands/group').yargs)
        yargs.command(require('./subcommands/ungroup').yargs)
        yargs.command(require('./subcommands/load').yargs)
        yargs.command(require('./subcommands/save').yargs)
        yargs.command(require('./subcommands/import').yargs)
        yargs.command(require('./subcommands/export').yargs)
        yargs.command(require('./subcommands/remote').yargs)
        yargs.command(require('./subcommands/summary').yargs)
    }
}
