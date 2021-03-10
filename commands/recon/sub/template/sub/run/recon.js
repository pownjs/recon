const { Task, TaskSet, Template, TemplateSet, getArray } = require('./template')

class ReconAddTask extends Task {
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

        if (nodes) {
            if (!nodes.length) {
                return
            }

            nodes = await Promise.all(nodes.map(async(node) => {
                const result = await super.run(node.data())

                if (result) {
                    const { id: source } = node.data()

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

class ReconAddTaskSet extends TaskSet {
    async run(recon) {
        for await (let task of this.tasks) {
            if (!task) {
                continue
            }

            if (!task.run) {
                task = new ReconAddTask(task)
            }

            await task.run(recon)
        }
    }
}

class ReconRemoveTask extends Task {
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

        if (nodes) {
            if (!nodes.length) {
                return
            }

            nodes = await Promise.all(nodes.map((node) => {
                return super.run(node.data())
            }))

            nodes = nodes.filter(node => node)

            await recon.addNodes(nodes)
        }
        else {
            void(0)
        }
    }
}

class ReconRemoveTaskSet extends TaskSet {
    async run(recon) {
        for await (let task of this.tasks) {
            if (!task) {
                continue
            }

            if (!task.run) {
                task = new ReconRemoveTask(task)
            }

            await task.run(recon)
        }
    }
}

class ReconTransformTask extends Task {
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

            for await (let node of nodes) {
                const result = await super.run(node)

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

class ReconTransformTaskSet extends TaskSet {
    async run(recon) {
        for await (let task of this.tasks) {
            if (!task) {
                continue
            }

            if (!task.run) {
                task = new ReconTransformTask(task)
            }

            await task.run(recon)
        }
    }
}

class ReconTemplate extends Template {
    async runAddTask(recon, def) {
        const addTaskSet = new ReconAddTaskSet(getArray(def))

        await addTaskSet.run(recon)
    }

    async runRemoveTask(recon, def) {
        const removeTaskSet = new ReconRemoveTaskSet(getArray(def))

        await removeTaskSet.run(recon)
    }

    async runTransformTask(recon, def) {
        const transformTaskSet = new ReconTransformTaskSet(getArray(def))

        await transformTaskSet.run(recon)
    }

    async run(recon) {
        const { op, ops, operation, operations, add, remove, transform } = this.template

        // TODO: consolidate this

        for await (let o of getArray(op || ops || operation || operations)) {
            const { type, def, definition, conf, config } = o

            switch (type) {
                case 'add':
                    await this.runAddTask(recon, def || definition || conf || config || {})

                    break

                case 'remove':
                    await this.runRemoveTask(recon, def || definition || conf || config || {})

                    break

                case 'transform':
                    await this.runTransformTask(recon, def || definition || conf || config || {})

                    break

                default:
                    if (process.env.NODE_ENV !== 'production') {
                        console.debug(`Unknown operation ${type}`)
                    }
            }
        }

        if (add) {
            await this.runAddTask(recon, add)
        }

        if (remove) {
            await this.runRemoveTask(recon, remove)
        }

        if (transform) {
            await this.runTransformTask(recon, transform)
        }
    }
}

class ReconTemplateSet extends TemplateSet {
    async run(recon) {
        for await (let template of this.templates) {
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
