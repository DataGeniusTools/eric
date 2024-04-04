import React from 'react';
import { Handle, Position } from 'react-flow-renderer';
import { NumberOutlined, KeyOutlined, ClockCircleOutlined, FontSizeOutlined} from '@ant-design/icons';

const CustomNode = ({ data }) => {
  return (
    <div className="custom-node" style={{ color: 'rgb(15, 23, 42)', border: '1px solid #ddd', borderRadius: '4px', padding: '0px', minWidth: '200px', minHeight: '20px', background: '#fff' }}>
      <div className="title" style={{ fontWeight: '600', backgroundColor: '#eee', textAlign: 'left', marginBottom: '0px', paddingLeft: '10px', paddingRight: '10px', paddingTop: '5px', paddingBottom: '5px' }}>
        {data.title}
      </div>
      {data.attributes && data.attributes.length > 0 && (
        <div className="content" style={{ overflowY: 'auto', paddingLeft: '10px', paddingRight: '10px', paddingTop: '5px', paddingBottom: '5px' }}>
          {data.attributes.map((attribute, index) => (
              <div key={index} style={{ verticalAlign: 'middle', display: 'flex'}}>
                <div style={{marginRight: '8px'}}>
                  {(attribute.datatype === 'int' || attribute.datatype === 'double') ? <NumberOutlined style={{ fontSize: '10px', color: '#4a638d' }} /> : (attribute.datatype === 'date' ? <ClockCircleOutlined style={{ fontSize: '10px', color: '#4a638d' }} /> : <FontSizeOutlined style={{ fontSize: '10px', color: '#4a638d' }} /> ) }
                </div>
                <div style={{ fontWeight: attribute.isPrimaryKey === 'Y' ? '600' : 'normal' }}>{attribute.name}</div>
                <div style={{marginLeft: '8px', width: '100%', textAlign: 'right' }}>
                  {attribute.isPrimaryKey === 'Y' ? <KeyOutlined style={{ fontSize: '10px', color: '#4a638d' }} /> : ''}
                </div>
              </div>
          ))}
        </div>
        ) 
        }
      <Handle type="source" position={Position.Right} id="b" style={{ background: '#ddd' }} />
      <Handle type="source" position={Position.Left} id="d" style={{ background: '#ddd' }} />
    </div>
  );
};

export default CustomNode;
