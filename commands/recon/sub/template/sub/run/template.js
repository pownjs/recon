const esprima = require('esprima')
const jsonPath = require('jsonpath')
const deepmerge = require('deepmerge')
const staticEval = require('static-eval')
const { RegExp } = require('@pown/regexp')

const { asyncEvery, asyncSome } = require('./async')

// The following code will be move into its own module (@pown/engine) when we know it works
// well enough in this particular context.

const query = (object, path) => {
    if (!path.startsWith('$')) {
        path = `$.${path}`
    }

    return jsonPath.value(object, path)
}

const assign = (object, path, value) => {
    const root = object
    const parts = path.split('.')

    for (let i = 0; i < parts.length - 1; i++) {
        const part = parts[i]

        if (!object[part]) {
            object = object[part] = {}
        }
    }

    object[parts[parts.length - 1]] = value

    return root
}

const getArray = (input) => {
    return Array.isArray(input) ? input : input ? [input] : []
}

const getConditionFunc = (condition) => {
    return {
        'all': asyncEvery,

        'every': asyncEvery,
        'some': asyncSome,

        'and': asyncEvery,
        'or': asyncSome
    }[condition] || asyncEvery
}

const isString = (input) => {
    return typeof(input) === 'string' || input instanceof String
}

const isBuffer = (input) => {
    return Buffer.isBuffer(input)
}

class Matcher {
    constructor(matcher) {
        this.matcher = matcher
    }

    async match(object) {
        const { part, type, condition, word, words, regex, regexes, flag, flags, script } = this.matcher

        object = query(object, part || '$')

        switch (type) {
            case 'word':
            case 'words':
                if (isString(object) || isBuffer(object)) {
                    return getConditionFunc(condition)(getArray(word || words || ''), (word) => {
                        return object.indexOf(word) >= 0
                    })
                }
                else {
                    return false
                }

            case 'regex':
            case 'regexes':
                if (isString(object) || isBuffer(object)) {
                    return getConditionFunc(condition)(getArray(regex || regexes || ''), (regex) => {
                        return (new RegExp(regex, flag || flags || '')).test(object)
                    })
                }
                else {
                    return false
                }

            case 'script':
                return getConditionFunc(condition)(getArray(script || ''), (script) => {
                    return staticEval(esprima.parse(script || 'false').body[0].expression)
                })
        }

        if (process.env.NODE_ENV !== 'production') {
            console.debug(`Invalid matcher type ${type}`)
        }

        return false
    }
}

class MatcherSet {
    constructor(matchers, matchersCondition = 'and') {
        this.matchers = matchers
        this.matchersCondition = matchersCondition
    }

    async match(object) {
        return getConditionFunc(this.matcherCondition)(this.matchers, (matcher) => {
            if (!matcher) {
                return false
            }

            if (!matcher.match) {
                matcher = new Matcher(matcher)
            }

            return matcher.match(object)
        })
    }
}

class Extractor {
    constructor(extractor) {
        this.extractor = extractor
    }

    async extract(object) {
        const { part, type, name, jsonpath, value, path, regex, flag, flags, group, script } = this.extractor

        object = query(object, part || '$')

        switch (type) {
            case 'value':
            case 'jsonpath':
                return assign({}, name || 'value', query(object, value || jsonpath || path || '$'))

            case 'regex':
                if (isString(object) || isBuffer(object)) {
                    const match = (new RegExp(regex, flag || flags || '')).match(object)

                    if (match) {
                        return assign({}, name || 'value', match[group || 0])
                    }
                }
                else {
                    if (process.env.NODE_ENV !== 'production') {
                        console.debug(`Invalid regex input`)
                    }

                    return {}
                }

            case 'script':
                return assign({}, name || 'value', staticEval(esprima.parse(script || '""').body[0].expression))
        }

        if (process.env.NODE_ENV !== 'production') {
            console.debug(`Invalid extractor type ${type}`)
        }
    }
}

class ExtractorSet {
    constructor(extractors) {
        this.extractors = extractors
    }

    async extract(object) {
        const result = {}

        for (let extractor of this.extractors) {
            if (!extractor) {
                continue
            }

            if (!extractor.extract) {
                extractor = new Extractor(extractor)
            }

            Object.assign(result, deepmerge(result, await extractor.extract(object)))
        }

        return result
    }
}

class Task {
    constructor(task) {
        this.task = task
    }

    async match(object) {
        const {
            match,
            matcher,
            matchers,

            ['match-condition']: mc,
            ['matcher-condition']: mrc,
            ['matchers-condition']: mrsc,

            matchCondition = mc,
            matcherCondition = mrc,
            matchersCondition = mrsc
        } = this.task

        const m = getArray(match || matcher || matchers)
        const c = matchCondition || matcherCondition || matchersCondition || 'and'

        const ms = new MatcherSet(m, c)

        return ms.match(object)
    }

    async extract(object) {
        const {
            extract,
            extractor,
            extractors
        } = this.task

        const e = getArray(extract || extractor || extractors)

        const es = new ExtractorSet(e)

        return es.extract(object)
    }

    get data() {
        const {
            match,
            matcher,
            matchers,
            ['match-condition']: mc,
            ['matcher-condition']: mrc,
            ['matchers-condition']: mrsc,
            matchCondition,
            matcherCondition,
            matchersCondition,

            extract,
            extractor,
            extractors,

            ...data
        } = this.task

        match;
        matcher;
        matchers;
        mc;
        mrc;
        mrsc;
        matchCondition;
        matcherCondition;
        matchersCondition;
        extract;
        extractor;
        extractors;

        return data
    }

    async run(object) {
        if (await this.match(object)) {
            return deepmerge(this.data, await this.extract(object))
        }
    }
}

class TaskSet {
    constructor(tasks) {
        this.tasks = tasks
    }

    async run(object) {
        const result = {}

        for (let task of this.tasks) {
            if (!task) {
                continue
            }

            if (!task.run) {
                task = new Task()
            }

            Object.assign(result, await task.run(object))
        }

        return result
    }
}

// typically you would implement your own template by extending the base class

class Template {
    constructor(template) {
        this.template = template
    }

    get id() {
        return this.template.id
    }

    async run(action, object) {
        const { id, ...tasks } = this.template

        id;

        if (!Object.prototype.hasOwnProperty(tasks, action)) {
            return
        }

        const taskSet = new TaskSet(getArray(tasks[action]))

        return taskSet.run(object)
    }
}

// typically you would implement your own template set by extending the base class

class TemplateSet {
    constructor(templates) {
        this.templates = templates // TODO: sort by dependency
    }

    async run(action, object) {
        const results = {}

        for (let template of this.templates) {
            if (!template) {
                continue
            }

            if (!template.run) {
                template = new Template(template)
            }

            results[template.id] = await template.run(action, object)
        }

        return results
    }
}

module.exports = { Template, TemplateSet, Task, TaskSet, getArray }
