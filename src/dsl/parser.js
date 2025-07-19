/**
 * DSL parser for ERic application using Ohm.js
 */

import * as ohm from 'ohm-js';
import grammar from './grammar.js';

// Create a single grammar instance to avoid conflicts
const g = ohm.grammar(grammar);

/**
 * Creates semantics for toString operation
 * @returns {Object} Semantics object for toString
 */
export const createToStringSemantics = () => {
  return g.createSemantics().addOperation('toString', {
    Statements(e) {
      return e.toString();
    },
    Statement(e) {
      return e.toString();
    },
    EntityDeclaration(entity, name, as, alias, attributes) {
      var name1 = name.toString();
      if (as.numChildren > 0)
        name1 += " as " + alias.toString()[0];
      return "Entity " + name1 + attributes.toString();
    },
    Attributes(open, e, close) {
      return " { " + e.toString() + " }";
    },
    Attribute(name, type, pk) {
      if (pk.numChildren > 0)
        return name.toString() + "🔑 " + type.toString();
      else
        return name.toString() + " " + type.toString();
    },
    RefDeclaration(ref, refelement, refName) {
      if (refName.numChildren > 0)
        return "Ref " + refelement.toString() + " [ " + refName.toString() + " ]";
      else
        return "Ref " + refelement.toString();
    },
    RefElement(e) {
      return e.toString();
    },
    RefEntity(name1, greater, name2) {
      return name1.toString() + " → " + name2.toString();
    },
    RefAttribute(name11, dot11, name12, greater, name21, dot21, name22) {
      return name11.toString() + "." + name12.toString() + " → " + name21.toString() + "." + name22.toString();
    },
    RefName(as, name) {
      return name.sourceString;
    },
    Name(e) {
      return e.sourceString;
    },
    datatype(e) {
      return e.toString();
    },
    quotedident(quote1, name, quote2) {
      return "\"" + name.toString() + "\"";
    },
    ident(letter, alnum) {
      return this.sourceString;
    },
    _iter(...children) {
      return children.map(c => c.toString());
    },
    _terminal() {
      return this.sourceString;
    },
  });
};

/**
 * Creates semantics for nodes operation
 * @returns {Object} Semantics object for nodes
 */
export const createNodesSemantics = () => {
  return g.createSemantics().addOperation('nodes', {
    Statements(e) {
      return {
        nodes: e.nodes().filter(n => n) // remove empty array elements
      }
    },
    Statement(e) {
      if (e.ctorName === 'EntityDeclaration') {
        return e.nodes();
      }
    },
    EntityDeclaration(entity, name, as, alias, attributes) {
      var aliasName = name.nodes();
      if (alias.numChildren > 0) {
        aliasName = alias.nodes()[0];
      }
      // Flatten the attributes array if it's nested
      const flatAttributes = attributes.nodes().flat();
      return {
        name: name.nodes(),
        alias: aliasName,
        attributes: flatAttributes,
        hasAttributes: attributes.numChildren > 0 ? 'Y' : 'N'
      };
    },
    Attributes(open, e, close) {
      return e.nodes();
    },
    Attribute(name, type, pk) {
      return {
        name: name.nodes(),
        datatype: type.nodes()[0],
        isPrimaryKey: pk.numChildren > 0 ? 'Y' : 'N'
      };
    },
    Name(e) {
      return e.nodes();
    },
    datatype(e) {
      return e.nodes();
    },
    quotedident(quote1, name, quote2) {
      return name.sourceString;
    },
    ident(letter, alnum) {
      return this.sourceString;
    },
    _iter(...children) {
      return children.map(c => c.nodes());
    },
    _terminal() {
      return this.sourceString;
    },
  });
};

/**
 * Creates semantics for edges operation
 * @returns {Object} Semantics object for edges
 */
export const createEdgesSemantics = () => {
  return g.createSemantics().addOperation('edges', {
    Statements(e) {
      return {
        edges: e.edges().filter(e => e) // remove empty array elements
      }
    },
    Statement(e) {
      if (e.ctorName === 'RefDeclaration') {
        return e.edges();
      }
    },
    RefDeclaration(ref, refelement, refName) {
      const refData = refelement.edges();
      if (refName.numChildren > 0) {
        refData.name = refName.edges();
      }
      return refData;
    },
    RefElement(e) {
      return e.edges();
    },
    RefEntity(entity1, greater, entity2) {
      return {
        type: 'EntityRef',
        from: entity1.edges(),
        to: entity2.edges(),
        name: entity1.edges() + " → " + entity2.edges()
      };
    },
    RefAttribute(entity1, dot11, attribute1, greater, entity2, dot21, attribute2) {
      return {
        type: 'AttributeRef',
        from: entity1.edges(),
        to: entity2.edges(),
        fromAttribute: attribute1.edges(),
        toAttribute: attribute2.edges(),
        name: entity1.edges() + "." + attribute1.edges() + " → " + entity2.edges() + "." + attribute2.edges()
      };
    },
    RefName(as, name) {
      return name.edges();
    },
    datatype(e) {
      return e.edges();
    },
    quotedident(quote1, name, quote2) {
      return name.sourceString;
    },
    ident(letter, alnum) {
      return this.sourceString;
    },
    _iter(...children) {
      return children.map(c => c.edges());
    },
    _terminal() {
      return this.sourceString;
    },
  });
};

/**
 * Parses DSL code and returns nodes and edges
 * @param {string} code - The DSL code to parse
 * @returns {Object} Object containing nodes and edges, or error information
 */
export const parseDSL = (code) => {
  try {
    const result = g.match(code);
          if (result.succeeded()) {
        const nodesSemantics = createNodesSemantics();
        const edgesSemantics = createEdgesSemantics();
        
        const semNodes = nodesSemantics(result);
        const semEdges = edgesSemantics(result);
      
      return {
        success: true,
        matchResult: result, // Keep the original MatchResult for toString
        nodes: semNodes.nodes().nodes || [],
        edges: semEdges.edges().edges || []
      };
    } else {
      return {
        success: false,
        error: result.shortMessage
      };
    }
  } catch (error) {
    return {
      success: false,
      error: error.message
    };
  }
};

/**
 * Converts parsed nodes to React Flow nodes
 * @param {Array} nodes - Parsed nodes from DSL
 * @returns {Array} React Flow nodes
 */
export const convertNodesToReactFlow = (nodes) => {
  console.log('convertNodesToReactFlow input:', nodes, typeof nodes, Array.isArray(nodes));
  
  if (!nodes || !Array.isArray(nodes)) {
    console.log('convertNodesToReactFlow: returning empty array');
    return [];
  }
  
  return nodes.map((node, index) => ({
    id: node.alias,
    type: 'custom',
    position: { x: index * 200, y: index * 100 },
    data: {
      label: node.name,
      attributes: node.attributes || []
    }
  }));
};

/**
 * Converts parsed edges to React Flow edges
 * @param {Array} edges - Parsed edges from DSL
 * @param {Array} nodes - Parsed nodes from DSL
 * @returns {Array} React Flow edges
 */
export const convertEdgesToReactFlow = (edges, nodes) => {
  console.log('convertEdgesToReactFlow input:', edges, typeof edges, Array.isArray(edges));
  
  if (!edges || !Array.isArray(edges)) {
    console.log('convertEdgesToReactFlow: returning empty array');
    return [];
  }
  
  return edges.map(edge => {
    let from = edge.from;
    let to = edge.to;
    
    // Find matching nodes for aliases
    const matchingNode = nodes.find(n => n.alias === edge.from);
    if (matchingNode && matchingNode.alias !== matchingNode.name) {
      from = matchingNode.name;
    }
    
    const matchingNode2 = nodes.find(n => n.alias === edge.to);
    if (matchingNode2 && matchingNode2.alias !== matchingNode2.name) {
      to = matchingNode2.name;
    }
    
    return edge.type === 'EntityRef' ? {
      id: from + "-" + to,
      source: from,
      target: to,
      label: edge.name,
      type: 'smoothstep'
    } : {
      id: from + "-" + to,
      source: from,
      target: to,
      sourceHandle: edge.fromAttribute ? `${edge.from}-source-${edge.fromAttribute}` : undefined,
      targetHandle: edge.toAttribute ? `${edge.to}-target-${edge.toAttribute}` : undefined,
      label: edge.name,
      type: 'smoothstep'
    };
  });
}; 