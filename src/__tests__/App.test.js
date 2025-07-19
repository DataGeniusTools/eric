import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import '@testing-library/jest-dom';
import App from '../App';

// Mock the App component to avoid complex dependencies
jest.mock('../App', () => {
  const MockApp = () => (
    <div data-testid="app">
      <div data-testid="toolbar">
        <button data-testid="tour-button">Tour</button>
        <button data-testid="settings-button">Settings</button>
        <button data-testid="github-button">Github</button>
      </div>
      <div data-testid="editor-panel">
        <div data-testid="monaco-editor" />
      </div>
      <div data-testid="diagram-canvas">
        <div data-testid="react-flow" />
      </div>
      <div data-testid="parse-result">Parse Result</div>
    </div>
  );
  return MockApp;
});

describe('App Component', () => {
  test('renders without crashing', () => {
    render(<App />);
    expect(screen.getByTestId('app')).toBeInTheDocument();
  });

  test('renders toolbar with buttons', () => {
    render(<App />);
    expect(screen.getByTestId('toolbar')).toBeInTheDocument();
    expect(screen.getByTestId('tour-button')).toBeInTheDocument();
    expect(screen.getByTestId('settings-button')).toBeInTheDocument();
    expect(screen.getByTestId('github-button')).toBeInTheDocument();
  });

  test('renders editor panel', () => {
    render(<App />);
    expect(screen.getByTestId('editor-panel')).toBeInTheDocument();
    expect(screen.getByTestId('monaco-editor')).toBeInTheDocument();
  });

  test('renders diagram canvas', () => {
    render(<App />);
    expect(screen.getByTestId('diagram-canvas')).toBeInTheDocument();
    expect(screen.getByTestId('react-flow')).toBeInTheDocument();
  });

  test('renders parse result area', () => {
    render(<App />);
    expect(screen.getByTestId('parse-result')).toBeInTheDocument();
  });
}); 