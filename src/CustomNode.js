import React from 'react';
import { Handle, Position } from 'react-flow-renderer';

const CustomNode = ({ data }) => {
  return (
    <div className="custom-node" style={{ color: 'rgb(15, 23, 42)', border: '1px solid #ddd', borderRadius: '4px', padding: '0px', minWidth: '100px', minHeight: '20px', background: '#fff' }}>
      <div className="title" style={{ fontWeight: '600', backgroundColor: '#eee', textAlign: 'left', marginBottom: '0px', paddingLeft: '10px', paddingRight: '10px', paddingTop: '5px', paddingBottom: '5px' }}>
        {data.title}
      </div>
      {data.attributes && data.attributes.length > 0 && (
        <div className="content" style={{ overflowY: 'auto', paddingLeft: '10px', paddingRight: '10px', paddingTop: '5px', paddingBottom: '5px' }}>
          {data.attributes.map((attribute, index) => (
            <div key={index}>{attribute.name}</div>
          ))}
        </div>
      )}
      <Handle type="source" position={Position.Top} id="a" style={{ background: '#ddd' }} />
      <Handle type="source" position={Position.Right} id="b" style={{ background: '#ddd' }} />
      <Handle type="source" position={Position.Bottom} id="c" style={{ background: '#ddd' }} />
      <Handle type="source" position={Position.Left} id="d" style={{ background: '#ddd' }} />
    </div>
  );
};

export default CustomNode;
