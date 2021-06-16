const serialize = (obj) => {
    return obj
}

const deserialize = (obj) => {
    // NOTE: there is no need to handle String, Number, Boolean and other native objects because
    // we assume this method is only used in the context of deserialising object created by the
    // structured clone algorithm - i.e. due to message passing

    switch (true) {
        case obj === null:
            return obj

        case Array.isArray(obj):
            return obj.map(deserialize)

        case ArrayBuffer.isView(obj):
            return Buffer.from(obj, obj.byteOffset, obj.byteLength)

        case typeof(obj) === 'object':
            return Object.assign({}, ...Object.entries(obj).map(([key, value]) => ({
                [key]: deserialize(value)
            })))

        default:
            return obj
    }
}

module.exports = { serialize, deserialize }
