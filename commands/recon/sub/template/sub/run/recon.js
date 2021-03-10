const { Task, TaskSet, Template, TemplateSet, getArray } = require('./template')

const nodesToArray = (nodes) => {
    if (nodes) {
        return nodes.map(node => node.data())
    }
    else {
        []
    }
}

class AddTask extends Task {
    async run(recon, nodes) {
        const { select, traverse } = this.task

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

        const results = []

        if (nodes) {
            if (nodes.length) {
                nodes = await Promise.all(nodes.map(async(node) => {
                    const data = node.data()

                    const result = await super.run(data)

                    if (result) {
                        const { id: source } = data

                        const { id, type, label, props } = result

                        return { id: id ? id : `${type}:${label}`, type, label, props: props || {}, edges: [source] }
                    }
                }))

                nodes = nodes.filter(node => node)

                results.push(nodesToArray(...await recon.addNodes(nodes)))
            }
        }
        else {
            const result = await super.run({})

            if (result) {
                const { id, type, label, props } = result

                results.push(nodesToArray(...await recon.addNodes([{ id: id ? id : `${type}:${label}`, type, label, props: props || {} }])))
            }
        }

        return results
    }
}

class AddTaskSet extends TaskSet {
    async run(recon) {
        const selection = recon.selection

        const results = []

        for (let task of this.tasks) {
            if (!task) {
                continue
            }

            if (!task.run) {
                task = new AddTask(task)
            }

            results.push(...await task.run(recon, selection))
        }

        return results
    }
}

class TransformTask extends Task {
    async run(recon, nodes) {
        const { select, traverse } = this.task

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

        const results = []

        if (nodes) {
            if (nodes.length) {
                // TODO: rather than doing this, filter all nodes and apply the transform at once

                for (let node of nodes) {
                    const data = node.data()

                    const result = await super.run(data)

                    if (result) {
                        const { transform, transformation, name, ...rest } = result

                        results.push(nodesToArray(...await recon.transform(transform || transformation || name || '', rest, rest)))
                    }
                }
            }
        }
        else {
            void(0)
        }

        return results
    }
}

class TransformTaskSet extends TaskSet {
    async run(recon) {
        const selection = recon.selection

        const results = []

        for (let task of this.tasks) {
            if (!task) {
                continue
            }

            if (!task.run) {
                task = new TransformTask(task)
            }

            results.push(...await task.run(recon, selection))
        }

        return results
    }
}

class RemoveTask extends Task {
    async run(recon, nodes) {
        const { select, traverse } = this.task

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

        const results = []

        if (nodes) {
            if (nodes.length) {
                nodes = await Promise.all(nodes.map((node) => {
                    const data = node.data()

                    return super.run(data)
                }))

                nodes = nodes.filter(node => node)

                results.push(nodesToArray(...await recon.addNodes(nodes)))
            }
        }
        else {
            void(0)
        }

        return results
    }
}

class RemoveTaskSet extends TaskSet {
    async run(recon) {
        const selection = recon.selection

        const results = []

        for (let task of this.tasks) {
            if (!task) {
                continue
            }

            if (!task.run) {
                task = new RemoveTask(task)
            }

            results.push(...await task.run(recon, selection))
        }

        return results
    }
}

class OperationTask extends Task {
    async runAddTask(recon, def) {
        const ts = new AddTaskSet(getArray(def))

        return ts.run(recon)
    }

    async runTransformTask(recon, def) {
        const ts = new TransformTaskSet(getArray(def))

        return ts.run(recon)
    }

    async runRemoveTask(recon, def) {
        const ts = new RemoveTaskSet(getArray(def))

        return ts.run(recon)
    }

    async runSelectTask(recon, def) {
        const ts = new SelectTaskSet(getArray(def))

        return ts.run(recon)
    }

    async runTraverseTask(recon, def) {
        const ts = new TraverseTaskSet(getArray(def))

        return ts.run(recon)
    }

    async run(recon) {
        const { add, transform, remove, select, traverse } = this.task

        const results = {}

        if (add) {
            results.add = await this.runAddTask(recon, add)
        }

        if (transform) {
            results.transform = await this.runTransformTask(recon, transform)
        }

        if (remove) {
            results.remove = await this.runRemoveTask(recon, remove)
        }

        if (select) {
            results.select = await this.runSelectTask(recon, select)
        }

        if (traverse) {
            results.traverse = await this.runTraverseTrask(recon, traverse)
        }

        return results
    }
}

class OperationTaskSet extends TaskSet {
    async run(recon) {
        const results = []

        for (let task of this.tasks) {
            if (!task) {
                continue
            }

            if (!task.run) {
                task = new OperationTask(task)
            }

            results.push(...await task.run(recon))
        }

        return results
    }
}

class SelectTask extends Task {
    async run(recon) {
        const { select, expression, ...rest } = this.task

        const expr = select || expression

        let nodes

        if (expr) {
            nodes = recon.select(expr)
        }

        const results = []

        if (nodes) {
            if (nodes.length) {
                const task = new OperationTask(rest)

                results.push(await task.run(recon))
            }
        }
        else {
            void(0)
        }

        return results
    }
}

class SelectTaskSet extends TaskSet {
    async run(recon) {
        const results = []

        for (let task of this.tasks) {
            if (!task) {
                continue
            }

            if (!task.run) {
                task = new SelectTask(task)
            }

            results.push(...await task.run(recon))
        }

        return results
    }
}

class TraverseTask extends Task {
    async run(recon) {
        const { traverse, expression, ...rest } = this.task

        const expr = traverse || expression

        let nodes

        if (expr) {
            nodes = recon.traverse(expr)
        }

        const results = []

        if (nodes) {
            if (nodes.length) {
                const task = new OperationTask(rest)

                results.push(await task.run(recon))
            }
        }
        else {
            void(0)
        }

        return results
    }
}

class TraverseTaskSet extends TaskSet {
    async run(recon) {
        const results = []

        for (let task of this.tasks) {
            if (!task) {
                continue
            }

            if (!task.run) {
                task = new TraverseTask(task)
            }

            results.push(...await task.run(recon))
        }

        return results
    }
}

class ReconTemplate extends Template {
    async run(recon) {
        const { add, transform, remove, select, traverse, op, ops, operation, operations } = this.template

        const results = []

        const ot = new OperationTask({ add, transform, remove, select, traverse })

        results.push(await ot.run(recon))

        const ots = new OperationTaskSet(getArray(op || ops || operation || operations))

        results.push(...await ots.run(recon))

        return results
    }
}

class ReconTemplateSet extends TemplateSet {
    async run(recon) {
        const results = {}

        for (let template of this.templates) {
            if (!template) {
                continue
            }

            if (!template.run) {
                template = new ReconTemplate(template)
            }

            results[template.id || Math.random().toString(32).slice(2)] = await template.run(recon)
        }

        return results
    }
}

module.exports = { ReconTemplate, ReconTemplateSet }
