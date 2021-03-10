const { Task, TaskSet, Template, TemplateSet, getArray } = require('./template')

class AddTask extends Task {
    async run(recon) {
        const { select, traverse } = this.task

        let nodes

        if (select) {
            nodes = recon.select(select)
        }
        else
        if (traverse) {
            nodes = recon.traverse(traverse)
        }
        else {
            nodes = recon.selection
        }

        if (nodes) {
            if (!nodes.length) {
                return
            }

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

            await recon.addNodes(nodes)
        }
        else {
            const result = await super.run({})

            if (result) {
                const { id, type, label, props } = result

                await recon.addNodes([{ id: id ? id : `${type}:${label}`, type, label, props: props || {} }])
            }
        }
    }
}

class AddTaskSet extends TaskSet {
    async run(recon) {
        for (let task of this.tasks) {
            if (!task) {
                continue
            }

            if (!task.run) {
                task = new AddTask(task)
            }

            await task.run(recon)
        }
    }
}

class TransformTask extends Task {
    async run(recon) {
        const { select, traverse } = this.task

        let nodes

        if (select) {
            nodes = recon.select(select)
        }
        else
        if (traverse) {
            nodes = recon.traverse(traverse)
        }
        else {
            nodes = recon.selection
        }

        if (nodes) {
            if (!nodes.length) {
                return
            }

            // TODO: rather than doing this, filter all nodes and apply the transform at once

            for (let node of nodes) {
                const data = node.data()

                const result = await super.run(data)

                if (result) {
                    const { transform, transformation, name, ...rest } = result

                    await recon.transform(transform || transformation || name || '', rest, rest)
                }
            }
        }
        else {
            void(0)
        }
    }
}

class TransformTaskSet extends TaskSet {
    async run(recon) {
        for (let task of this.tasks) {
            if (!task) {
                continue
            }

            if (!task.run) {
                task = new TransformTask(task)
            }

            await task.run(recon)
        }
    }
}

class RemoveTask extends Task {
    async run(recon) {
        const { select, traverse } = this.task

        let nodes

        if (select) {
            nodes = recon.select(select)
        }
        else
        if (traverse) {
            nodes = recon.traverse(traverse)
        }
        else {
            nodes = recon.selection
        }

        if (nodes) {
            if (!nodes.length) {
                return
            }

            nodes = await Promise.all(nodes.map((node) => {
                const data = node.data()

                return super.run(data)
            }))

            nodes = nodes.filter(node => node)

            await recon.addNodes(nodes)
        }
        else {
            void(0)
        }
    }
}

class RemoveTaskSet extends TaskSet {
    async run(recon) {
        for (let task of this.tasks) {
            if (!task) {
                continue
            }

            if (!task.run) {
                task = new RemoveTask(task)
            }

            await task.run(recon)
        }
    }
}

class OperationTask extends Task {
    async runAddTask(recon, def) {
        const ts = new AddTaskSet(getArray(def))

        await ts.run(recon)
    }

    async runTransformTask(recon, def) {
        const ts = new TransformTaskSet(getArray(def))

        await ts.run(recon)
    }

    async runRemoveTask(recon, def) {
        const ts = new RemoveTaskSet(getArray(def))

        await ts.run(recon)
    }

    async runSelectTask(recon, def) {
        const ts = new SelectTaskSet(getArray(def))

        await ts.run(recon)
    }

    async runTraverseTask(recon, def) {
        const ts = new TraverseTaskSet(getArray(def))

        await ts.run(recon)
    }

    async run(recon) {
        const { add, transform, remove, select, traverse } = this.task

        if (add) {
            await this.runAddTask(recon, add)
        }

        if (transform) {
            await this.runTransformTask(recon, transform)
        }

        if (remove) {
            await this.runRemoveTask(recon, remove)
        }

        if (select) {
            await this.runSelectTask(recon, select)
        }

        if (traverse) {
            await this.runTraverseTrask(recon, traverse)
        }
    }
}

class OperationTaskSet extends TaskSet {
    async run(recon) {
        for (let task of this.tasks) {
            if (!task) {
                continue
            }

            if (!task.run) {
                task = new OperationTask(task)
            }

            await task.run(recon)
        }
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

        if (nodes) {
            if (!nodes.length) {
                return
            }

            const task = new OperationTask(rest)

            await task.run(recon)
        }
        else {
            void(0)
        }
    }
}

class SelectTaskSet extends TaskSet {
    async run(recon) {
        for (let task of this.tasks) {
            if (!task) {
                continue
            }

            if (!task.run) {
                task = new SelectTask(task)
            }

            await task.run(recon)
        }
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

        if (nodes) {
            if (!nodes.length) {
                return
            }

            const task = new OperationTask(rest)

            await task.run(recon)
        }
        else {
            void(0)
        }
    }
}

class TraverseTaskSet extends TaskSet {
    async run(recon) {
        for (let task of this.tasks) {
            if (!task) {
                continue
            }

            if (!task.run) {
                task = new TraverseTask(task)
            }

            await task.run(recon)
        }
    }
}

class ReconTemplate extends Template {
    async run(recon) {
        const { add, transform, remove, select, traverse, op, ops, operation, operations } = this.template

        const ot = new OperationTask({ add, transform, remove, select, traverse })

        await ot.run(recon)

        const ots = new OperationTaskSet(getArray(op || ops || operation || operations))

        await ots.run(recon)
    }
}

class ReconTemplateSet extends TemplateSet {
    async run(recon) {
        for (let template of this.templates) {
            if (!template) {
                continue
            }

            if (!template.run) {
                template = new ReconTemplate(template)
            }

            await template.run(recon)
        }
    }
}

module.exports = { ReconTemplate, ReconTemplateSet }
