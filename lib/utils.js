const makeId = (type, name, ...extra) => {
    return `${type ? type + ':' : ''}${name || Math.random().toString(32).substring(2)}${extra.join(':')}`
}

const makeNode = (node) => {
    const { id: _id, type = '', label = '', props = {}, edges = [], ...rest } = node

    const id = _id || makeId(type, label)

    return { ...rest, id, type, label, props, edges }
}

module.exports = { makeId, makeNode }
