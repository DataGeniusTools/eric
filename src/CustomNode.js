import React from 'react';
import { Handle } from 'react-flow-renderer';

const CustomNode = ({ data }) => {
  return (
    <div className="custom-node" style={{ border: '1px solid #ccc', borderRadius: '4px', padding: '2px', width: '100px', height: '60px', background: '#cccccc' }}>
      <Handle type="target" position="top" style={{ background: '#555' }} />
      <div className="title" style={{ backgroundColor: data.color }}>
        {data.title}
      </div>
      <div className="content" style={{ overflowY: 'auto' }}>
        {data.text.split('\n').map((line, index) => (
          <p key={index}>{line}</p>
        ))}
      </div>
      <Handle type="source" position="bottom" style={{ background: '#555' }} />
    </div>
  );
};

export default CustomNode;
