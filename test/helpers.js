const makeStringNode = (string) => {
    return { id: Math.random().toString(32).substring(2), label: string, props: { string } }
}

module.exports = { makeStringNode }
