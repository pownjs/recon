#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const root = path.join(__dirname, '..', 'lib', 'transforms')

const code = fs.readdirSync(root)
    .filter((name) => {
        return name !== 'index.js'
    })
    .map((name) => {
        return { name, module: require(path.join(root, name)) }
    })
    .map(({ name, module }) => {
        return Object.entries(module)
            .map(([transformer, module]) => {
                const { alias = [], title = '', description = '', types = [], options = {}, noise = 1 } = module

                return `exports[${JSON.stringify(transformer)}] = ${JSON.stringify({alias, title, description, types, options, noise}, '', '    ')}

exports[${JSON.stringify(transformer)}].load = function () { return require(${JSON.stringify('.' + path.sep + name)})[${JSON.stringify(transformer)}] }`
            })
            .join('\n\n')
    })
    .join('\n\n')

fs.writeFileSync(path.join(root, 'index.js'), code + '\n')
