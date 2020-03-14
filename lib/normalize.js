const normalizeDomain = (input) => {
    return input.trim().toLowerCase().replace(/\.+/g, '.').replace(/^(\*\.)+/, '').replace(/^\.+/, '').replace(/\.+$/, '')
}

module.exports = {
    normalizeDomain
}
