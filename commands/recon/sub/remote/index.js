exports.yargs = {
    command: 'remote <command>',
    describe: 'Remote managment',
    aliases: ['remotes', 'f'],

    builder: (yargs) => {
        yargs.command(require('./list').yargs)
        yargs.command(require('./add').yargs)
        yargs.command(require('./remove').yargs)
    }
}
