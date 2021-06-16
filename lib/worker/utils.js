const serialize = (obj) => {
    // NOTE: this method is only available for consistency reasons because we rely on the structured
    // cloning algorithm to do the heavy lifting, but keep in mind that there is a chance that the
    // serialised and deseiralised object will be different, which should not be a problem for most
    // intents and purposes

    return obj
}

const deserialize = (obj) => {
    // NOTE: there is no need to handle String, Number, Boolean and other native objects because
    // we assume this method is only used in the context of deserializing object created by the
    // structured clone algorithm - i.e. due to message passing

    switch (true) {
        case obj === null:
            return obj

        case Array.isArray(obj):
            return obj.map(deserialize)

        case ArrayBuffer.isView(obj):
            return Buffer.from(obj, obj.byteOffset, obj.byteLength)

        case typeof(obj) === 'object':
            if (obj.type === 'Buffer' && Array.isArray(obj.data)) {
                return Buffer.from(obj.data)
            }
            else {
                return Object.assign({}, ...Object.entries(obj).map(([key, value]) => ({
                    [key]: deserialize(value)
                })))
            }

        default:
            return obj
    }
}

module.exports = { serialize, deserialize }
