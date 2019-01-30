const makeId = (type, name, ...extra) => {
    return `${type ? type + ':' : ''}${name || Math.random().toString(32).substring(2)}${extra.join(':')}`
}

module.exports = { makeId }
