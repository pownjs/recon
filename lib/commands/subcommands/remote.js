exports.yargs = {
    command: 'remote <command>',
    describe: 'Remote managment',
    aliases: ['r'],

    builder: (yargs) => {
        yargs.command(require('./remote/list').yargs)
        yargs.command(require('./remote/add').yargs)
        yargs.command(require('./remote/remove').yargs)
    }
}
