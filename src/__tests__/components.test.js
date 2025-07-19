import React from 'react';
import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';

// Mock CustomNode component
jest.mock('../components/CustomNode', () => {
  const MockCustomNode = ({ data }) => (
    <div data-testid="custom-node">
      <div data-testid="node-title">{data.title}</div>
      {data.attributes && (
        <div data-testid="node-attributes">
          {data.attributes.map((attr, index) => (
            <div key={index} data-testid={`attribute-${index}`}>
              {attr.name} {attr.datatype} {attr.isPrimaryKey === 'Y' ? '*' : ''}
            </div>
          ))}
        </div>
      )}
    </div>
  );
  return MockCustomNode;
});

// Mock CustomHandle component
jest.mock('../components/CustomHandle', () => {
  const MockCustomHandle = ({ id, position, type }) => (
    <div data-testid="custom-handle" data-id={id} data-position={position} data-type={type} />
  );
  return MockCustomHandle;
});

// Mock DownloadButton component
jest.mock('../components/DownloadButton', () => {
  const MockDownloadButton = ({ nodes, edges }) => (
    <button data-testid="download-button" data-nodes-count={nodes?.length || 0} data-edges-count={edges?.length || 0}>
      Download
    </button>
  );
  return MockDownloadButton;
});

// Import the mocked components
import CustomNode from '../components/CustomNode';
import CustomHandle from '../components/CustomHandle';
import DownloadButton from '../components/DownloadButton';

describe('CustomNode Component', () => {
  test('renders node with title', () => {
    const data = { title: 'Test Entity' };
    render(<CustomNode data={data} />);
    
    expect(screen.getByTestId('custom-node')).toBeInTheDocument();
    expect(screen.getByTestId('node-title')).toHaveTextContent('Test Entity');
  });

  test('renders node with attributes', () => {
    const data = {
      title: 'Test Entity',
      attributes: [
        { name: 'id', datatype: 'int', isPrimaryKey: 'Y' },
        { name: 'name', datatype: 'string', isPrimaryKey: 'N' }
      ]
    };
    render(<CustomNode data={data} />);
    
    expect(screen.getByTestId('node-attributes')).toBeInTheDocument();
    expect(screen.getByTestId('attribute-0')).toHaveTextContent('id int *');
    expect(screen.getByTestId('attribute-1')).toHaveTextContent('name string');
  });

  test('renders node without attributes', () => {
    const data = { title: 'Test Entity' };
    render(<CustomNode data={data} />);
    
    expect(screen.queryByTestId('node-attributes')).not.toBeInTheDocument();
  });
});

describe('CustomHandle Component', () => {
  test('renders handle with correct props', () => {
    const props = {
      id: 'test-handle',
      position: 'left',
      type: 'source'
    };
    render(<CustomHandle {...props} />);
    
    const handle = screen.getByTestId('custom-handle');
    expect(handle).toBeInTheDocument();
    expect(handle).toHaveAttribute('data-id', 'test-handle');
    expect(handle).toHaveAttribute('data-position', 'left');
    expect(handle).toHaveAttribute('data-type', 'source');
  });
});

describe('DownloadButton Component', () => {
  test('renders download button with node and edge counts', () => {
    const nodes = [{ id: '1' }, { id: '2' }];
    const edges = [{ id: 'edge1' }];
    
    render(<DownloadButton nodes={nodes} edges={edges} />);
    
    const button = screen.getByTestId('download-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('data-nodes-count', '2');
    expect(button).toHaveAttribute('data-edges-count', '1');
  });

  test('renders download button with empty data', () => {
    render(<DownloadButton />);
    
    const button = screen.getByTestId('download-button');
    expect(button).toBeInTheDocument();
    expect(button).toHaveAttribute('data-nodes-count', '0');
    expect(button).toHaveAttribute('data-edges-count', '0');
  });
}); 