import React, { useState, useEffect } from 'react';
import { Layout, Input } from 'antd';
import MonacoEditor from '@monaco-editor/react';
import ReactFlow, { MiniMap } from 'react-flow-renderer';
import * as ohm from 'ohm-js';
import grammar from './Ohm.js';
import logo from './logo.png';

const { Header, Content } = Layout;

const App = () => {
  const defaultCode = `
    Entity Sales as S {
      sold_date date
      product_id int
      amount int
    }

    Entity Product as P {
      id int [pk]
      name string
      Product string
    }

    Entity Region as R

    Ref Sales > Region
  `;

  const [code, setCode] = useState(defaultCode);
  const [matchResult, setMatchResult] = useState(null);

  const editorOptions = {
    wordWrap: 'on',
    tabSize: 2,
    minimap: { enabled: false },
  };

  useEffect(() => {
    const result = ohm.grammar(grammar).match(defaultCode);
	if (result.succeeded())
		setMatchResult("No errors found");
	else
	    setMatchResult(result.shortMessage);
  }, []); // Empty dependency array runs the effect only once on mount

  const handleEditorChange = (newCode, event) => {
    setCode(newCode);
    const result = ohm.grammar(grammar).match(newCode);
	if (result.succeeded())
		setMatchResult("No errors found");
	else
	    setMatchResult(result.shortMessage);
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center' }}>
        <div style={{ marginRight: '24px' }}>
          <img src={logo} alt="Logo" style={{ height: '32px' }} />
        </div>
        <h1 style={{ color: '#fff', margin: 0 }}>ERic</h1>
      </Header>
      <Content style={{ padding: '24px' }}>
        <div style={{ display: 'flex', gap: '24px' }}>
          {/* Monaco Editor */}
          <div style={{ flex: 1 }}>
            <MonacoEditor
              height="600px"
              defaultLanguage="text"
              defaultValue={defaultCode}
              value={code}
              options={editorOptions}
              onChange={handleEditorChange}
            />
          </div>
          {/* React Flow */}
          <div style={{ flex: 1 }}>
            <ReactFlow elements={[]} style={{ height: '600px', border: '1px solid #e5e5e5' }}>
              <MiniMap />
            </ReactFlow>
          </div>
        </div>
        {/* Textfeld für die Anzeige des matchResult */}
        <div style={{ marginTop: '24px' }}>
          <Input.TextArea
            value={matchResult ? matchResult.toString() : 'No match result'}
            placeholder="Match Result"
            autoSize={{ minRows: 3, maxRows: 6 }}
            readOnly
          />
        </div>
      </Content>
    </Layout>
  );
};

export default App;
