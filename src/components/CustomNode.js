import React from 'react';
import { Handle, Position } from 'react-flow-renderer';
import { NumberOutlined, KeyOutlined, ClockCircleOutlined, FontSizeOutlined} from '@ant-design/icons';
import { CustomHandle } from "./CustomHandle";

const CustomNode = ({ data }) => {
  return (
    <div className="custom-node" style={{ color: 'rgb(15, 23, 42)', border: '1px solid #ddd', borderRadius: '4px', padding: '0px', minWidth: '200px', minHeight: '20px', background: '#fff' }}>
      <div className="title" style={{ fontWeight: '600', backgroundColor: '#eee', textAlign: 'left', marginBottom: '0px', paddingLeft: '10px', paddingRight: '10px', paddingTop: '5px', paddingBottom: '5px', position: 'relative' }}>
        <Handle type="source" position={Position.Left} id={`${data.title}-entity-left`} style={{ background: '#000' }} />
        {data.title}
        <CustomHandle
              //id={`${model.id}-source-${field.name}`}
              id={`${data.title}-entity-right`}
              position={Position.Right}
              type="target"
            />
      </div>
      {data.attributes && data.attributes.length > 0 && (
        <div className="content" > {/*style={{ overflowY: 'auto' }}*/}
          {data.attributes.map((attribute, index) => (
              <div key={index} style={{ verticalAlign: 'middle', display: 'flex', position: 'relative', paddingLeft: '10px', paddingRight: '10px', paddingTop: '5px', paddingBottom: '5px'}}>
                <Handle type="source" position={Position.Left} id={`${data.title}-source-${attribute.name}`} style={{ background: '#ddd' }} />
                <div style={{marginRight: '8px'}}>
                  {(attribute.datatype === 'int' || attribute.datatype === 'double') ? <NumberOutlined style={{ fontSize: '10px', color: '#4a638d' }} /> : (attribute.datatype === 'date' ? <ClockCircleOutlined style={{ fontSize: '10px', color: '#4a638d' }} /> : <FontSizeOutlined style={{ fontSize: '10px', color: '#4a638d' }} /> ) }
                </div>
                <div style={{ fontWeight: attribute.isPrimaryKey === 'Y' ? '600' : 'normal' }}>{attribute.name}</div>
                <div style={{marginLeft: '8px', width: '100%', textAlign: 'right' }}>
                  {attribute.isPrimaryKey === 'Y' ? <KeyOutlined style={{ fontSize: '10px', color: '#4a638d' }} /> : ''}
                </div>
                <Handle type="target" position={Position.Right} id={`${data.title}-target-${attribute.name}`} style={{ background: '#ddd' }} />
              </div>
          ))}
        </div>
        ) 
        }
    </div>
  );
};

export default CustomNode;

/*

<Handle type="source" position={Position.Right} id="b" style={{ background: '#ddd' }} />
*/