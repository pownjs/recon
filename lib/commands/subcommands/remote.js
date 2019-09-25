exports.yargs = {
    command: 'remote <command>',
    describe: 'Remote managment',
    aliases: ['x'],

    builder: (yargs) => {
        yargs.command(require('./remote/list').yargs)
        yargs.command(require('./remote/add').yargs)
        yargs.command(require('./remote/remove').yargs)
    }
}
