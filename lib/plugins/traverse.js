const esprima = require('esprima')
const staticEval = require('static-eval')

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

    traverseByName: {},

    traverseByScript: {}
}

function parseDate(date) {
    if (date === 'now') {
        return new Date()
    }
    else {
        return new Date(date)
    }
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

    const traverseByName = function(name) {
        const traversal = namedTraversals[name]

        if (!traversal) {
            throw new Error(`Unrecognized traversal name ${name}`)
        }

        return this.traverse(traversal)
    }

    cytoscape('core', 'traverseByName', traverseByName)
    cytoscape('collection', 'traverseByName', traverseByName)

    const traverseByScript = function(script) {
        const expression = esprima.parse(script || 'false').body[0].expression

        return this.filter((node) => {
            return staticEval(expression, { node, parseDate, parseInt, parseFloat })
        })
    }

    cytoscape('core', 'traverseByScript', traverseByScript)
    cytoscape('collection', 'traverseByScript', traverseByScript)

    const traverse = function(expression) {
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
                    let subCollection

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

                        if (subCollection) {
                            subCollection = subCollection.union(subSubCollection)
                        }
                        else {
                            subCollection = subSubCollection
                        }
                    })

                    returnCollection = subCollection
                }
            })

            return returnCollection
        })

        let returnCollection

        traversorCollections.forEach((traversorCollection) => {
            if (returnCollection) {
                returnCollection = returnCollection.union(traversorCollection)
            }
            else {
                returnCollection = traversorCollection
            }
        })

        return returnCollection
    }

    cytoscape('core', 'traverse', traverse)
    cytoscape('collection', 'traverse', traverse)
}

module.exports = { traverse }
