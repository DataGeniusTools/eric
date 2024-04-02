import React, { useState, useEffect } from 'react';
import { Layout, Space, Input } from 'antd';
import MonacoEditor from '@monaco-editor/react';
import ReactFlow, { MiniMap } from 'react-flow-renderer';
import * as ohm from 'ohm-js';
import grammar from './Ohm.js';
import logo from './logo.png';
import SplitPane, { Pane } from 'split-pane-react';
import 'split-pane-react/esm/themes/default.css';

const { Header, Content } = Layout;

const App = () => {
	const defaultCode = `Entity Sales as S {
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

Ref Sales > Region`;
	const [code, setCode] = useState(defaultCode);
	const [matchResult, setMatchResult] = useState(null);
	const [splitPaneSizes, setSplitPaneSizes] = useState([250, '30%', 'auto']);
	const editorOptions = {
		wordWrap: 'on',
		tabSize: 2,
		minimap: { enabled: false },
	};
	useEffect(() => {
		const result = ohm.grammar(grammar).match(defaultCode);
		if (result.succeeded()) {
			setMatchResult("No errors found");
		} else {
			setMatchResult(result.shortMessage);
		}
		// eslint-disable-next-line react-hooks/exhaustive-deps
	}, []); // Leeres Abhängigkeitsarray mit eslint-ignore-Kommentar
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
				<Space size="middle">
					<img src={logo} alt="Logo" style={{ height: '32px', verticalAlign: 'middle' }} />
					<h1 style={{ color: '#fff', margin: 0 }}>ERic</h1>
				</Space>
			</Header>
			<Content style={{ padding: '0px', height: 'calc(100vh - 100px)' }}>
				<SplitPane
					split='vertical'
					sizes={splitPaneSizes}
					onChange={setSplitPaneSizes}
				>
					<Pane minSize={150} maxSize='50%'>
						{/* Monaco Editor */}
						<MonacoEditor
							height="88%"
							defaultLanguage="text"
							defaultValue={defaultCode}
							value={code}
							options={editorOptions}
							onChange={handleEditorChange}
						/>
						{/* Textfeld für die Anzeige des matchResult */}
						<div style={{ marginTop: '24px' }}>
							<Input.TextArea
								value={matchResult ? matchResult.toString() : 'No match result'}
								placeholder="Match Result"
								autoSize={{ minRows: 3, maxRows: 6 }}
								readOnly
							/>
						</div>
					</Pane>
					<Pane>
						{/* React Flow */}
						<ReactFlow elements={[]} style={{ height: '100%', border: '1px solid #e5e5e5' }}>
							<MiniMap />
						</ReactFlow>
					</Pane>
				</SplitPane>
			</Content>
		</Layout>
	);
};

export default App;
