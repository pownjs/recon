#!/usr/bin/env node

const fs = require('fs')
const path = require('path')

const censor = (canary) => (key, value) => {
    if (value == Infinity) {
        return canary
    }

    return value
}

const objectdump = (object) => {
    const canary = Math.random().toString(32).slice(2)

    return JSON.stringify(object, censor(canary), '    ').split(`"${canary}"`).join('Infinity')
}

const quote = (input) => {
    return JSON.stringify(input)
}

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
                const { alias, title, description, group, tags, types, options, priority, noise } = module

                return `
exports[${JSON.stringify(transformer)}] = ${objectdump({alias, title, description, group, tags, types, options, priority, noise})}

exports[${JSON.stringify(transformer)}].load = function() { return require(${quote('.' + path.sep + name)})[${quote(transformer)}] }`
            })
            .join('\n\n')
    })
    .join('\n')

fs.writeFileSync(path.join(root, 'index.js'), '// WARNING: This is an auto-generated file.\n' + code + '\n')
