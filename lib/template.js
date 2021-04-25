const deepmerge = require('deepmerge')
const { Template } = require('@pown/engine/lib/template')

class ReconTemplate extends Template {
    async runTask(taskName, task, input = {}, recon, nodes, ...args) {
        const { select, traverse, ...data } = await this.getTaskDefinition(task)

        if (select) {
            nodes = recon.select(select)
        }
        else
        if (traverse) {
            nodes = recon.traverse(traverse)
        }
        else {
            nodes = nodes || recon.selection
        }

        if (nodes && nodes.length) {
            if (['add'].includes(taskName)) {
                nodes = await Promise.all(nodes.map(async(node) => {
                    const nodeData = node.data()

                    if (await this.matchWithTask(task, nodeData)) {
                        const extract = await this.extractWithTask(task, nodeData)

                        const { id, type, label, props = {} } = deepmerge(extract, data)

                        return { id: id ? id : `${type}:${label}`, type, label, props, edges: [nodeData.id] }
                    }
                }))

                nodes = nodes.filter(node => node)

                await recon.addNodes(nodes)
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

                await recon.removeNodes(nodes)
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
        }

        return { id: task.id, name: taskName, result: {}, input, matches: true, extracts: {}, output: {} }
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
                const { selection, select = selection, ...rest } = task

                const nodes = recon.select(select)

                yield* super.runTaskDefinitionsIt(rest, input, recon, nodes, ...args)
            }
        }
        else
        if (['traverse', 'traversal'].includes(taskName)) {
            for (let task of tasks) {
                const { traversal, traverse = traversal, ...rest } = task

                const nodes = recon.traverse(traverse)

                yield* super.runTaskDefinitionsIt(rest, input, recon, nodes, ...args)
            }
        }
        else {
            yield* super.runTaskSetIt(taskName, tasks, input, recon, ...args)
        }
    }
}

module.exports = { ReconTemplate }
