const deepmerge = require('deepmerge')
const { Template } = require('@pown/engine/lib/template')

class ReconTemplate extends Template {
    constructor(doc, options) {
        const { scheduler, ...restOfOptions } = options || {}

        super(doc, restOfOptions)

        this.scheduler = scheduler
    }

    async executeTask(taskName, task, input = {}) {
        switch (taskName) {
            case 'request':
                return this.scheduler.request(this.interpolate(task, input))

            default:
                throw new Error(`Unrecognized task ${taskName}`)
        }
    }

    async runTask(taskName, task, input = {}, recon, nodes, ...args) {
        if (['request'].includes(taskName)) {
            return super.runTask(taskName, task, input)
        }
        else {
            const { select, traverse, ...data } = await this.getTaskDefinition(task)

            if (select) {
                nodes = recon.select(select)
            }
            else
            if (traverse) {
                nodes = recon.traverse(traverse)
            }

            if (nodes) {
                if (nodes.length) {
                    if (['add'].includes(taskName)) {
                        nodes = await Promise.all(nodes.map(async(node) => {
                            const nodeData = node.data()

                            if (await this.matchWithTask(task, nodeData)) {
                                const extract = await this.extractWithTask(task, nodeData)

                                const { id, type, label, props = {} } = deepmerge(extract, data)

                                return { id: id ? id : `${type}:${label}`, type, label: this.interpolate(label, input), props: this.interpolate(props, input), edges: [nodeData.id] }
                            }
                        }))

                        nodes = nodes.filter(node => node)

                        await recon.add(nodes)
                    }
                    else
                    if (['remove'].includes(taskName)) {
                        nodes = await Promise.all(nodes.map(async(node) => {
                            const nodeData = node.data()

                            if (await this.matchWithTask(task, nodeData)) {
                                return { id: nodeData.id }
                            }
                        }))

                        nodes = nodes.filter(node => node)

                        await recon.remove(nodes)
                    }
                    else
                    if (['transform'].includes(taskName)) {
                        nodes = await Promise.all(nodes.map(async(node) => {
                            const nodeData = node.data()

                            if (await this.matchWithTask(task, nodeData)) {
                                return nodeData
                            }
                        }))

                        nodes = nodes.filter(node => node)

                        const { transformation, transform = transformation, ...rest } = data

                        await recon.transform(transform, nodes, rest, rest)
                    }
                    else {
                        throw new Error(`Unrecognized task ${taskName}`)
                    }

                    return { id: task.id, name: taskName, result: {}, input, matches: true, extracts: {}, output: {} }
                }
            }
            else {
                if (['add'].includes(taskName)) {
                    if (await this.matchWithTask(task, input)) {
                        const extract = await this.extractWithTask(task, input)

                        const { id, type, label, props = {} } = deepmerge(extract, data)

                        await recon.add({ id: id ? id : `${type}:${label}`, type, label: this.interpolate(label, input), props: this.interpolate(props, input) })
                    }
                }

                return { id: task.id, name: taskName, result: {}, input, matches: true, extracts: {}, output: {} }
            }
        }
    }

    async * runTaskSetIt(taskName, tasks, input = {}, recon, ...args) {
        if (['op', 'ops', 'operation', 'operations'].includes(taskName)) {
            for (let task of tasks) {
                yield* this.runTaskDefinitionsIt(task, input, recon, ...args)
            }
        }
        else
        if (['select', 'selection'].includes(taskName)) {
            for (let task of tasks) {
                const { selection, select = selection, exp = selection, expression = exp, ...rest } = task

                const nodes = recon.select(expression)

                yield* super.runTaskDefinitionsIt(rest, input, recon, nodes, ...args)
            }
        }
        else
        if (['traverse', 'traversal'].includes(taskName)) {
            for (let task of tasks) {
                const { traversal, traverse = traversal, exp = traverse, expression = exp, ...rest } = task

                const nodes = recon.traverse(expression)

                yield* super.runTaskDefinitionsIt(rest, input, recon, nodes, ...args)
            }
        }
        else {
            yield* super.runTaskSetIt(taskName, tasks, input, recon, ...args)
        }
    }
}

module.exports = { ReconTemplate }
