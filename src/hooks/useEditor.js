/**
 * Custom hook for managing Monaco editor functionality
 */

import { useRef, useCallback } from 'react';
import { editorKeywords, languageDef, configuration } from '../components/editor-config.js';

/**
 * Custom hook for managing Monaco editor functionality
 * @returns {Object} Editor state and functions
 */
export const useEditor = () => {
  const monacoRef = useRef(null);
  const monacoEditorRef = useRef(null);

  /**
   * Sets up Monaco editor before mounting
   * @param {Object} monaco - Monaco instance
   */
  const editorWillMount = useCallback((monaco) => {
    if (!monaco.languages.getLanguages().some(({ id }) => id === 'eric')) {
      // Register a new language
      monaco.languages.register({ id: 'eric' });
      
      // Register a tokens provider for the language
      monaco.languages.setMonarchTokensProvider('eric', languageDef);
      
      // Set the editing configuration for the language
      monaco.languages.setLanguageConfiguration('eric', configuration);
      
      // Set Theme
      monaco.languages.registerCompletionItemProvider('eric', {
        provideCompletionItems: (model, position) => {
          const suggestions = [
            ...editorKeywords.map(k => {
              return {
                label: k,
                kind: monaco.languages.CompletionItemKind.Keyword,
                insertText: k,
              };
            })
          ];
          return { suggestions: suggestions };
        }
      });
    }
  }, []);

  /**
   * Handles editor mounting
   * @param {Object} editor - Editor instance
   * @param {Object} monaco - Monaco instance
   */
  const editorOnMount = useCallback((editor, monaco) => {
    monacoRef.current = monaco;
    monacoEditorRef.current = editor;
  }, []);

  /**
   * Sets editor markers for syntax errors
   * @param {Object} model - Editor model
   * @param {Array} markers - Array of markers
   */
  const setEditorMarkers = useCallback((model, markers) => {
    if (monacoRef.current && model) {
      monacoRef.current.editor.setModelMarkers(model, 'msg', markers);
    }
  }, []);

  /**
   * Gets the current editor model
   * @returns {Object} Editor model
   */
  const getEditorModel = useCallback(() => {
    return monacoEditorRef.current?.getModel();
  }, []);

  /**
   * Gets the Monaco instance
   * @returns {Object} Monaco instance
   */
  const getMonacoInstance = useCallback(() => {
    return monacoRef.current;
  }, []);

  /**
   * Clears all editor markers
   */
  const clearEditorMarkers = useCallback(() => {
    if (monacoRef.current && monacoEditorRef.current) {
      const model = monacoEditorRef.current.getModel();
      if (model) {
        monacoRef.current.editor.setModelMarkers(model, 'msg', []);
      }
    }
  }, []);

  return {
    // Refs
    monacoRef,
    monacoEditorRef,
    
    // Functions
    editorWillMount,
    editorOnMount,
    setEditorMarkers,
    getEditorModel,
    getMonacoInstance,
    clearEditorMarkers
  };
}; 