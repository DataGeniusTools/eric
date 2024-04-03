import React from 'react';
import { Handle } from 'react-flow-renderer';

const CustomNode = ({ data }) => {
  return (
    <div className="custom-node" style={{ color: 'rgb(15, 23, 42)', border: '1px solid #ddd', borderRadius: '4px', padding: '0px', minWidth: '100px', minHeight: '60px', background: '#fff' }}>
      <Handle type="target" position="top" style={{ background: '#555' }} />
      <div className="title" style={{ fontWeight: '600', backgroundColor: '#eee', textAlign: 'left', marginBottom: '0px', paddingLeft: '10px', paddingRight: '10px', paddingTop: '5px', paddingBottom: '5px' }}>
        {data.title}
      </div>
      { data.attributes ? (
        <div className="content" style={{ overflowY: 'auto', paddingLeft: '10px', paddingRight: '10px', paddingTop: '5px', paddingBottom: '5px' }}>
          {data.attributes.map((attribute, index) => (
            <div key={index}>{attribute.name}</div>
          ))}
        </div>
        ) : ''
        }
      <Handle type="source" position="bottom" style={{ background: '#555' }} />
    </div>
  );
};

export default CustomNode;
// data.color