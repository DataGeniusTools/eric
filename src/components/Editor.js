/**
 * Editor component for ERic application
 */

import React from 'react';
import MonacoEditor from '@monaco-editor/react';
import { Tabs } from 'antd';
import { useEditor } from '../hooks/useEditor';
import { editorOptions } from './editor-config.js';

/**
 * Editor component for ERic application
 * @param {Object} props - Component props
 * @param {string} props.code - The DSL code
 * @param {Object} props.flow - The React Flow data
 * @param {Function} props.onCodeChange - Function called when DSL code changes
 * @param {Function} props.onFlowChange - Function called when flow data changes
 * @param {React.Ref} props.monacoEditorTour - Ref for monaco editor tour
 */
const Editor = ({
  code,
  flow,
  onCodeChange,
  onFlowChange,
  monacoEditorTour
}) => {
  const {
    editorWillMount,
    editorOnMount
  } = useEditor();

  const tabs = [
    {
      key: '1',
      label: 'DSL',
      children: (
        <MonacoEditor
          height="75vh"
          value={code}
          options={editorOptions}
          onChange={onCodeChange}
          language="eric"
          beforeMount={editorWillMount}
          onMount={editorOnMount}
        />
      )
    },
    {
      key: '2',
      label: 'Flow',
      children: flow && (
        <MonacoEditor
          height="75vh"
          value={JSON.stringify(flow, null, 2)}
          onChange={onFlowChange}
          language="json"
        />
      )
    }
  ];

  return (
    <div ref={monacoEditorTour} style={{ height: '88%' }}>
      <Tabs 
        defaultActiveKey="1" 
        items={tabs} 
        tabBarStyle={{ paddingLeft: '20px' }} 
      />
    </div>
  );
};

export default Editor; 