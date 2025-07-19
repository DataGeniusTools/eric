/**
 * Tests for custom hooks
 */

import { renderHook, act } from '@testing-library/react';
import { useTour } from '../hooks/useTour';
import { useEditor } from '../hooks/useEditor';

// Mock the storage service
jest.mock('../services/storage', () => ({
  loadTourPreference: jest.fn(),
  saveTourPreference: jest.fn()
}));

const mockLoadTourPreference = require('../services/storage').loadTourPreference;
const mockSaveTourPreference = require('../services/storage').saveTourPreference;

// Mock Ant Design Modal
jest.mock('antd', () => ({
  Modal: {
    confirm: jest.fn()
  }
}));

describe('Custom Hooks', () => {
  describe('useTour', () => {
    beforeEach(() => {
      jest.clearAllMocks();
      mockLoadTourPreference.mockReturnValue(false);
    });

    test('should initialize with default values', () => {
      const { result } = renderHook(() => useTour());
      
      expect(result.current.isTourOpen).toBe(true); // Tour opens automatically on first render
      expect(result.current.isTourDisabled).toBeDefined();
      expect(result.current.openTour).toBeDefined();
      expect(result.current.closeTour).toBeDefined();
      expect(result.current.toggleTourDisabled).toBeDefined();
    });

    test('should initialize with tour disabled', () => {
      mockLoadTourPreference.mockReturnValue(true);
      const { result } = renderHook(() => useTour());
      
      expect(result.current.isTourOpen).toBe(false);
      expect(result.current.isTourDisabled).toBe(true);
    });

    test('should open tour when openTour is called', () => {
      mockLoadTourPreference.mockReturnValue(true);
      const { result } = renderHook(() => useTour());
      
      act(() => {
        result.current.openTour();
      });
      
      expect(result.current.isTourOpen).toBe(true);
    });

    test('should close tour when closeTour is called', () => {
      const { result } = renderHook(() => useTour());
      
      act(() => {
        result.current.closeTour();
      });
      
      expect(result.current.isTourOpen).toBe(false);
    });

    test('should toggle tour disabled state', () => {
      const { result } = renderHook(() => useTour());
      const initialState = result.current.isTourDisabled;
      
      act(() => {
        result.current.toggleTourDisabled();
      });
      
      expect(result.current.isTourDisabled).toBe(!initialState);
      expect(mockSaveTourPreference).toHaveBeenCalledWith(!initialState);
    });

    test('should provide all required refs', () => {
      const { result } = renderHook(() => useTour());
      
      expect(result.current.mainWindowTour).toBeDefined();
      expect(result.current.monacoEditorTour).toBeDefined();
      expect(result.current.reactFlowTour).toBeDefined();
      expect(result.current.parseResultTour).toBeDefined();
      expect(result.current.gitLinkTour).toBeDefined();
      expect(result.current.tourButtonTour).toBeDefined();
      expect(result.current.settingsButtonTour).toBeDefined();
    });
  });

  describe('useEditor', () => {
    test('should initialize with default values', () => {
      const { result } = renderHook(() => useEditor());
      
      expect(result.current.monacoRef).toBeDefined();
      expect(result.current.monacoEditorRef).toBeDefined();
      expect(result.current.editorWillMount).toBeDefined();
      expect(result.current.editorOnMount).toBeDefined();
      expect(result.current.setEditorMarkers).toBeDefined();
      expect(result.current.getEditorModel).toBeDefined();
      expect(result.current.getMonacoInstance).toBeDefined();
      expect(result.current.clearEditorMarkers).toBeDefined();
    });

    test('should handle editor mounting', () => {
      const { result } = renderHook(() => useEditor());
      const mockEditor = { getModel: jest.fn() };
      const mockMonaco = { languages: { getLanguages: jest.fn() } };
      
      act(() => {
        result.current.editorOnMount(mockEditor, mockMonaco);
      });
      
      expect(result.current.monacoEditorRef.current).toBe(mockEditor);
      expect(result.current.monacoRef.current).toBe(mockMonaco);
    });

    test('should handle editor will mount', () => {
      const { result } = renderHook(() => useEditor());
      const mockMonaco = {
        languages: {
          getLanguages: jest.fn().mockReturnValue([]),
          register: jest.fn(),
          setMonarchTokensProvider: jest.fn(),
          setLanguageConfiguration: jest.fn(),
          registerCompletionItemProvider: jest.fn()
        }
      };
      
      act(() => {
        result.current.editorWillMount(mockMonaco);
      });
      
      expect(mockMonaco.languages.register).toHaveBeenCalledWith({ id: 'eric' });
    });

    test('should handle setting editor markers', () => {
      const { result } = renderHook(() => useEditor());
      const mockMonaco = {
        editor: {
          setModelMarkers: jest.fn()
        }
      };
      const mockModel = {};
      const mockMarkers = [{ message: 'test' }];
      
      result.current.monacoRef.current = mockMonaco;
      
      act(() => {
        result.current.setEditorMarkers(mockModel, mockMarkers);
      });
      
      expect(mockMonaco.editor.setModelMarkers).toHaveBeenCalledWith(mockModel, 'msg', mockMarkers);
    });

    test('should handle clearing editor markers', () => {
      const { result } = renderHook(() => useEditor());
      const mockMonaco = {
        editor: {
          setModelMarkers: jest.fn()
        }
      };
      const mockEditor = {
        getModel: jest.fn().mockReturnValue({})
      };
      
      result.current.monacoRef.current = mockMonaco;
      result.current.monacoEditorRef.current = mockEditor;
      
      act(() => {
        result.current.clearEditorMarkers();
      });
      
      expect(mockMonaco.editor.setModelMarkers).toHaveBeenCalledWith({}, 'msg', []);
    });
  });
}); 