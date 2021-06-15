// TODO: do better detection than this

const urlRegex = /^https?:\/\//i

const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const ipv4Regex = /^(\d\d?\d?\.\d\d?\d?\.\d\d?\d?\.\d\d?\d?|\d{10})$/

const ipv6Regex = /^([0-9A-Fa-f]{1,4}:){7}[0-9A-Fa-f]{1,4}$/

const domainRegex = /^(([a-zA-Z]{1})|([a-zA-Z]{1}[a-zA-Z]{1})|([a-zA-Z]{1}[0-9]{1})|([0-9]{1}[a-zA-Z]{1})|([a-zA-Z0-9][a-zA-Z0-9-_]{1,61}[a-zA-Z0-9]))\.([a-zA-Z]{2,6}|[a-zA-Z0-9-]{2,30}\.[a-zA-Z]{2,3})$/

const isUrl = (input) => {
    return urlRegex.test(input || '')
}

const isEmail = (input) => {
    return emailRegex.test(input || '')
}

const isIpv4 = (input) => {
    return ipv4Regex.test(input || '')
}

const isIpv6 = (input) => {
    return ipv6Regex.test(input || '')
}

const isIp = (input) => {
    return isIpv4(input) || isIpv6(input)
}

const isDomain = (input) => {
    return domainRegex.test(input || '')
}

const isSubdomain = (input) => {
    // NOTE: this method rather basic and error prone
    // TODO: fix me

    return isDomain(input) && input.split('.').length - 1 >= 2
}

const isSubdomainOf = (input, root) => {
    if (!root.startsWith('.')) {
        root = '.' + root
    }

    input = input.toLowerCase().trim()
    root = root.toLowerCase().trim()

    return input.endsWith(root)
}

module.exports = { isUrl, isEmail, isIpv4, isIpv6, isIp, isDomain, isSubdomain, isSubdomainOf }
