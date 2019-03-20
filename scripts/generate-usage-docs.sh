#!/usr/bin/env bash

COMMANDS="pown"
SUBCOMMANDS="recon"
SUBSUBCOMMANDS="transform select diff merge add remove group ungroup save"

export POWN_ROOT=.

for C in $COMMANDS
do
    for SC in $SUBCOMMANDS
    do
        echo '## Usage'
        echo
        echo '> **WARNING**: This pown command is currently under development and as a result will be subject to breaking changes.'
        echo
        echo '```'
        $C $SC --help
        echo '```'
        echo

        for SSC in $SUBSUBCOMMANDS
        do
            echo "### \`$C $SC $SSC\`"
            echo
            echo '```'
            $C $SC $SSC --help
            echo '```'
            echo
        done
    done
done
