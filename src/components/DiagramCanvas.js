/**
 * Diagram Canvas component for ERic application
 */

import React, { useState, useCallback } from 'react';
import ReactFlow, { 
  MiniMap, 
  Controls, 
  ControlButton, 
  ConnectionMode
} from 'reactflow';
import { ForkOutlined, BorderOuterOutlined } from '@ant-design/icons';
import 'reactflow/dist/style.css';
import CustomNode from './CustomNode';
import SimpleFloatingEdge from './SimpleFloatingEdge';
import DownloadButton from './DownloadButton';

const nodeTypes = {
  custom: CustomNode,
};

const edgeTypes = {
  floating: SimpleFloatingEdge,
};

/**
 * DiagramCanvas component for ERic application
 * @param {Object} props - Component props
 * @param {Array} props.nodes - React Flow nodes
 * @param {Array} props.edges - React Flow edges
 * @param {Function} props.onNodesChange - Function called when nodes change
 * @param {Function} props.onEdgesChange - Function called when edges change
 * @param {Function} props.onLayout - Function called for layout changes
 * @param {React.Ref} props.reactFlowTour - Ref for react flow tour
 */
const DiagramCanvas = ({
  nodes,
  edges,
  onNodesChange,
  onEdgesChange,
  onLayout,
  reactFlowTour
}) => {
  // fitView is available but not used in this component
  const [showMiniMap, setShowMiniMap] = useState(false);

  const toggleMiniMap = useCallback(() => {
    setShowMiniMap(!showMiniMap);
  }, [showMiniMap]);

  const handleLayout = useCallback((direction) => {
    onLayout({ direction });
  }, [onLayout]);

  return (
    <div 
      ref={reactFlowTour}
      style={{ 
        width: '100%', 
        height: '100%',
        position: 'relative'
      }}
    >
      <ReactFlow
        nodes={nodes}
        onNodesChange={onNodesChange}
        edges={edges}
        onEdgesChange={onEdgesChange}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        connectionMode={ConnectionMode.Loose}
        fitView={nodes && nodes.length > 0}
        style={{ 
          height: '100%', 
          border: '1px solid #e5e5e5', 
          backgroundColor: '#fff', 
          fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif' 
        }}
      >
        <Controls position="bottom-left">
          <ControlButton 
            title="automatic layout" 
            onClick={() => handleLayout('RIGHT')}
          >
            <ForkOutlined />
          </ControlButton>
          <ControlButton 
            title="mini map" 
            onClick={toggleMiniMap}
          >
            <BorderOuterOutlined />
          </ControlButton>
          <DownloadButton />
        </Controls>
        {showMiniMap && <MiniMap />}
      </ReactFlow>
    </div>
  );
};

export default DiagramCanvas; 