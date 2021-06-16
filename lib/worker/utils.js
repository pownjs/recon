const serialize = (obj) => {
    return obj
}

const deserialize = (obj) => {
    switch (true) {
        case Array.isArray(obj):
            return obj

        case Buffer.isBuffer(obj):
            return obj

        case ArrayBuffer.isView(obj):
            return Buffer.from(obj, obj.byteOffset, obj.byteLength)

        case typeof(obj) === 'object':
            return Object.assign({}, ...Object.entries(obj).map(([key, value]) => {
                return {
                    [key]: deserialize(value)
                }
            }))

        default:
            return obj
    }
}

module.exports = { serialize, deserialize }
