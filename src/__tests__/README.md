# Test Documentation

This directory contains all test files for the ERic application.

## Test Structure

### `App.test.js`
Tests for the main App component functionality:
- Component rendering
- UI element presence
- Basic component structure

### `utils.test.js`
Tests for utility functions:
- `hasDuplicates()` - Tests for duplicate detection in arrays

### `parser.test.js`
Tests for Ohm.js grammar and parser:
- Grammar parsing for various DSL constructs
- Semantics operations (toString)
- Error handling for invalid syntax

### `components.test.js`
Tests for React components:
- `CustomNode` - Entity node rendering
- `CustomHandle` - Connection handle rendering  
- `DownloadButton` - Download functionality

### `integration.test.js`
Integration tests for complete DSL parsing:
- Complete ER diagram DSL parsing
- Node and edge extraction
- Complex DSL scenarios with aliases and quoted names

## Running Tests

### All Tests
```bash
npm test
```

### Non-interactive Tests
```bash
npm run test:no-watch
```

### Specific Test File
```bash
npm test -- --testPathPattern=parser.test.js
```

### With Coverage
```bash
npm run test:coverage
```

## Test Coverage

The tests cover:
- ✅ Component rendering and structure
- ✅ Utility functions
- ✅ DSL grammar parsing
- ✅ Semantics operations
- ✅ Integration scenarios
- ✅ Error handling

## Mock Strategy

The tests use comprehensive mocking to isolate units:
- React Flow components are mocked
- Monaco Editor is mocked
- Ant Design components are mocked
- localStorage is mocked
- External dependencies are mocked

This ensures fast, reliable tests that don't depend on external services or complex UI libraries. 