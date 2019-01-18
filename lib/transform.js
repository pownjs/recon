class Transform {
    makeId() {
        return Math.random().toString(32).substring(2)
    }

    flatten(array, times) {
        let result = array

        for (let i = 0; i < times; i++) {
            result = [].concat(...result)
        }

        return result
    }
}

module.exports = { Transform }
