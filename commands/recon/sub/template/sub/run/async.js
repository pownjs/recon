// TODO: these needs to be move into the async module for better reusability

const asyncEvery = async(it, handler) => {
    for await (let e of it) {
        if (!await handler(e)) {
            return false
        }
    }

    return true
}

const asyncSome = async(it, handler) => {
    for await (let e of it) {
        if (await handler(e)) {
            return true
        }
    }

    return false
}

const asyncFilter = async(arr, handler) => {
    // TODO: make it work with iterators

    return arr.reduce(async(memo, e) => [...await memo, ...await handler(e) ? [e] : []], [])
}

const asyncFilterParalel = async(array, handler) => {
    // TODO: make it work with iterators

    return array.reduce(async(memo, e) => await handler(e) ? [...await memo, e] : memo, [])
}

module.exports = { asyncEvery, asyncSome, asyncFilter, asyncFilterParalel }
