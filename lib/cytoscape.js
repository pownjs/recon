const cytoscape = require('cytoscape')

const { traverse } = require('./plugins/traverse')

cytoscape.use(traverse)

module.exports = { cytoscape }
