const traverseFunctions = {
    filter: {},

    neighborhood: {},

    openNeighborhood: {},

    closedNeighborhood: {},

    component: {},

    components: {},

    edgesWith: {},

    edgesTo: {},

    connectedNodes: {},

    connectedEdges: {},

    sources: {},

    targets: {},

    parallelEdges: {},

    codirectedEdges: {},

    roots: {},

    leaves: {},

    outgoers: {},

    successors: {},

    incomers: {},

    predecessors: {},

    eq: {},

    first: {},

    last: {}
}

function traverse(cytoscape) {
    cytoscape('core', 'traverse', function(expression) {
        const traversorGroups = expression.match(/(\\.|[^/])+/gm).map(p => p.trim()).filter(p => p).map((part) => {
            part = part.replace(/\\\//g, '/')

            return part.match(/(\\.|[^|])+/gm).map(p => p.trim()).filter(p => p).map((part) => {
                part = part.replace(/\\\|/g, '|')

                const [name, ...input] = part.split(' ')

                return {
                    name: name.toLowerCase().trim() || '',
                    input: input.join(' ').trim() || '*'
                }
            })
        })

        let returnCollection = this

        traversorGroups.forEach((traversors, index) => {
            if (index == 0) {
                traversors.forEach(({ name, input }) => {
                    for (let traverseFunction of Object.keys(traverseFunctions)) {
                        if (traverseFunction.toLowerCase() === name) {
                            returnCollection = returnCollection[traverseFunction](input)

                            return
                        }
                    }

                    throw new Error(`Unrecognized traverse function ${name}`)
                })
            }
            else {
                let subCollection = this.collection()

                returnCollection.map((node) => {
                    let subSubCollection = this.collection().add(node)

                    traversors.forEach(({ name, input }) => {
                        for (let traverseFunction of Object.keys(traverseFunctions)) {
                            if (traverseFunction.toLowerCase() === name) {
                                subSubCollection = subSubCollection[traverseFunction](input)

                                return
                            }
                        }

                        throw new Error(`Unrecognized traverse function ${name}`)
                    })

                    subCollection = subCollection.merge(subSubCollection)
                })

                returnCollection = subCollection
            }
        })

        return returnCollection
    })
}

module.exports = { traverse }
