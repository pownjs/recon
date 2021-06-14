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

    last: {},

    traverseByName: {}
}

function traverse(cytoscape) {
    const namedTraversals = {}

    cytoscape('core', 'setTraversalByName', function(name, traversal) {
        namedTraversals[name] = traversal
    })

    cytoscape('core', 'getTraversalByName', function(name) {
        return namedTraversals[name]
    })

    cytoscape('core', 'delTraversalByName', function(name) {
        delete namedTraversals[name]
    })

    cytoscape('core', 'traverseByName', function(name) {
        const traversal = namedTraversals[name]

        if (!traversal) {
            throw new Error(`Unrecognized traversal name ${name}`)
        }

        return this.traverse(traversal)
    })

    cytoscape('core', 'traverse', function(expression) {
        const traversorCollections = expression.match(/(\\.|[^&])+/gm).map(p => p.trim()).filter(p => p).map((part) => {
            part = part.replace(/\\\&/g, '&')

            const traversorGroups = part.match(/(\\.|[^/])+/gm).map(p => p.trim()).filter(p => p).map((part) => {
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

        let returnCollection = this.collection()

        traversorCollections.forEach((traversorCollection) => {
            returnCollection = returnCollection.merge(traversorCollection)
        })

        return returnCollection
    })
}

module.exports = { traverse }
