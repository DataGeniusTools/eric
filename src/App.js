import MonacoEditor from '@monaco-editor/react';
import { Input, Layout, Space } from 'antd';
import * as ohm from 'ohm-js';
import React, { useState } from 'react';
import ReactFlow, { MiniMap } from 'react-flow-renderer';
import SplitPane, { Pane } from 'split-pane-react';
import 'split-pane-react/esm/themes/default.css';
import grammar from './Ohm.js';
import logo from './logo.png';

const { Header, Content } = Layout;

const App = () => {
	const [code, setCode] = useState(null);
	const [matchResult, setMatchResult] = useState(null);
	const [splitPaneSizes, setSplitPaneSizes] = useState([250, '30%', 'auto']);
	const editorOptions = {
		wordWrap: 'on',
		tabSize: 2,
		minimap: { enabled: false },
	};
	const handleEditorChange = (newCode, event) => {
		setCode(newCode);
		const g = ohm.grammar(grammar);
		const semantics = g.createSemantics().addOperation('eval', {
			Statements(e) {
				return e.eval();
			},
			Statement(e) {
				return e.eval();
			},
			Statement_entityDeclaration(entity, ident, as, ident2, attributes) {
				if (as.numChildren > 0)
					return "Entity " + ident.eval() + " ↣ " + ident2.eval() + attributes.eval();
				else
					return "Entity " + ident.eval() + attributes.eval();
			},
			Statement_refDeclaration(ref, refelement) {
				return "Ref " + refelement.eval();
			},
			Refelement(e) {
				return e.eval();
			},
			Refelement_rowRef(entity1, dot1, attribute1, greater, entity2, dot2, attribute2) {
				return entity1.eval() + "." + attribute1.eval() + " → " + entity2.eval() + "." + attribute2.eval();
			},
			Refelement_tableRef(entity1, greater, entity2) {
				return entity1.eval() + " → " + entity2.eval();
			},
			Attributes(open, e, close) {
				return " { " + e.eval() + " }";
			},
			Attribute(e, type, pk) {
				if (pk.numChildren > 0)
					return e.eval() + "🔑 " + type.eval();
				else
					return e.eval() + " " + type.eval();
			},
			datatype(e) {
				return e.eval();
			},
			ident(letter, alnum) {
				return this.sourceString;
			},
			_iter(...children) {
				return children.map(c => c.eval());
			},
			_terminal() {
				return this.sourceString;
			},
		});
		const result = g.match(newCode);
		if (result.succeeded())
			setMatchResult(semantics(result).eval());
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
