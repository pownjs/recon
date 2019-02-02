const urlRegex = /^https?:\/\//i
const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/

const isUrl = (input) => {
    return urlRegex.test(input)
}

const isEmail = (input) => {
    return emailRegex.test(input)
}

module.exports = { isUrl, isEmail }
