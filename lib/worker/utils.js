const serialize = (obj) => {
    return obj
}

const deserialize = (obj) => {
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
