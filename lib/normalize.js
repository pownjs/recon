const normalizeDomain = (input) => {
    return input.trim().toLowerCase().replace(/\.+$/, '').replace(/^(\*\.)+/, '')
}

module.exports = {
    normalizeDomain
}
