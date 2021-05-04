let cache

const getCache = () => {
    return cache
}

const setCache = (c) => {
    cache = c
}

const clearCache = (c) => {
    cache = undefined
}

module.exports = { getCache, setCache, clearCache }
