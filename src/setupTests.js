// jest-dom adds custom jest matchers for asserting on DOM nodes.
// allows you to do things like:
// expect(element).toHaveTextContent(/react/i)
// learn more: https://github.com/testing-library/jest-dom
import '@testing-library/jest-dom';

// Mock React Flow
jest.mock('react-flow-renderer', () => ({
  ReactFlowProvider: ({ children }) => children,
  useReactFlow: () => ({
    fitView: jest.fn(),
    getViewport: jest.fn(() => ({ x: 0, y: 0, zoom: 1 })),
    setViewport: jest.fn(),
  }),
  useNodesState: () => [[], jest.fn(), jest.fn()],
  useEdgesState: () => [[], jest.fn(), jest.fn()],
  applyNodeChanges: jest.fn((changes, nodes) => nodes),
  ConnectionMode: { Loose: 'loose' },
  Position: { Left: 'left', Right: 'right', Top: 'top', Bottom: 'bottom' },
  Handle: ({ children, ...props }) => <div data-testid="handle" {...props}>{children}</div>,
  MiniMap: () => <div data-testid="minimap" />,
  Controls: ({ children }) => <div data-testid="controls">{children}</div>,
  ControlButton: ({ children, ...props }) => <button data-testid="control-button" {...props}>{children}</button>,
}));

// Mock Monaco Editor
jest.mock('@monaco-editor/react', () => ({
  __esModule: true,
  default: ({ value, onChange, ...props }) => (
    <textarea
      data-testid="monaco-editor"
      value={value}
      onChange={(e) => onChange && onChange(e.target.value)}
      {...props}
    />
  ),
}));

// Mock Ant Design
jest.mock('antd', () => ({
  Input: ({ value, onChange, ...props }) => (
    <input data-testid="ant-input" value={value} onChange={(e) => onChange && onChange(e.target.value)} {...props} />
  ),
  Layout: {
    Content: ({ children, ...props }) => <div data-testid="layout-content" {...props}>{children}</div>,
  },
  Tabs: ({ items, ...props }) => (
    <div data-testid="tabs" {...props}>
      {items?.map((item, index) => (
        <div key={index} data-testid={`tab-${item.key}`}>
          {item.children}
        </div>
      ))}
    </div>
  ),
  Button: ({ children, onClick, ...props }) => (
    <button data-testid="ant-button" onClick={onClick} {...props}>{children}</button>
  ),
  Modal: ({ children, open, onCancel, ...props }) => (
    open ? <div data-testid="modal" {...props}>{children}</div> : null
  ),
  Switch: ({ checked, onChange, ...props }) => (
    <input
      type="checkbox"
      data-testid="switch"
      checked={checked}
      onChange={(e) => onChange && onChange(e.target.checked)}
      {...props}
    />
  ),
}));

// Mock localStorage
const localStorageMock = {
  getItem: jest.fn(),
  setItem: jest.fn(),
  removeItem: jest.fn(),
  clear: jest.fn(),
};
global.localStorage = localStorageMock;

// Mock window.matchMedia
Object.defineProperty(window, 'matchMedia', {
  writable: true,
  value: jest.fn().mockImplementation(query => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: jest.fn(), // deprecated
    removeListener: jest.fn(), // deprecated
    addEventListener: jest.fn(),
    removeEventListener: jest.fn(),
    dispatchEvent: jest.fn(),
  })),
});

// Mock ResizeObserver
global.ResizeObserver = jest.fn().mockImplementation(() => ({
  observe: jest.fn(),
  unobserve: jest.fn(),
  disconnect: jest.fn(),
})); 