class Transform {
    flatten(array, times) {
        let result = array

        for (let i = 0; i < times; i++) {
            result = [].concat(...result)
        }

        return result
    }
}

module.exports = { Transform }
