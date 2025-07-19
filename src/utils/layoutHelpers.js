/**
 * Layout helpers for ERic application
 * Handles automatic layout of React Flow diagrams using ELK
 */

import ELK from 'elkjs/lib/elk.bundled.js';

const elk = new ELK();

const DEFAULT_ELK_OPTIONS = {
  'elk.algorithm': 'layered',
  'elk.layered.spacing.nodeNodeBetweenLayers': '100',
  'elk.spacing.nodeNode': '80',
};

/**
 * Applies automatic layout to React Flow nodes and edges
 * @param {Array} nodes - React Flow nodes
 * @param {Array} edges - React Flow edges
 * @param {Object} options - Layout options
 * @returns {Promise<Object>} Object containing layouted nodes and edges
 */
export const getLayoutedElements = async (nodes, edges, options = {}) => {
  try {
    const layoutOptions = { ...DEFAULT_ELK_OPTIONS, ...options };
    const isHorizontal = layoutOptions['elk.direction'] === 'RIGHT';
    
    const graph = {
      id: 'root',
      layoutOptions,
      children: nodes.map((node) => ({
        ...node,
        // Adjust the target and source handle positions based on the layout direction
        targetPosition: isHorizontal ? 'left' : 'top',
        sourcePosition: isHorizontal ? 'right' : 'bottom',
        // Hardcode a width and height for elk to use when layouting
        width: 150,
        height: 50,
      })),
      edges: edges,
    };

    const layoutedGraph = await elk.layout(graph);
    
    return {
      nodes: layoutedGraph.children.map((node) => ({
        ...node,
        // React Flow expects a position property on the node instead of `x` and `y` fields
        position: { x: node.x, y: node.y },
      })),
      edges: layoutedGraph.edges,
    };
  } catch (error) {
    console.error('Error applying layout:', error);
    throw error;
  }
};

/**
 * Applies horizontal layout to the diagram
 * @param {Array} nodes - React Flow nodes
 * @param {Array} edges - React Flow edges
 * @returns {Promise<Object>} Layouted nodes and edges
 */
export const applyHorizontalLayout = (nodes, edges) => {
  return getLayoutedElements(nodes, edges, { 'elk.direction': 'RIGHT' });
};

/**
 * Applies vertical layout to the diagram
 * @param {Array} nodes - React Flow nodes
 * @param {Array} edges - React Flow edges
 * @returns {Promise<Object>} Layouted nodes and edges
 */
export const applyVerticalLayout = (nodes, edges) => {
  return getLayoutedElements(nodes, edges, { 'elk.direction': 'DOWN' });
};

/**
 * Calculates optimal spacing between nodes
 * @param {Array} nodes - React Flow nodes
 * @returns {Object} Optimal spacing configuration
 */
export const calculateOptimalSpacing = (nodes) => {
  const nodeCount = nodes.length;
  
  // Adjust spacing based on number of nodes
  if (nodeCount > 10) {
    return {
      'elk.spacing.nodeNode': '60',
      'elk.layered.spacing.nodeNodeBetweenLayers': '80'
    };
  } else if (nodeCount > 5) {
    return {
      'elk.spacing.nodeNode': '80',
      'elk.layered.spacing.nodeNodeBetweenLayers': '100'
    };
  }
  
  return {
    'elk.spacing.nodeNode': '100',
    'elk.layered.spacing.nodeNodeBetweenLayers': '120'
  };
}; 