// App.js
import React, { useState } from 'react';
import { Layout, Space } from 'antd';
import MonacoEditor from '@monaco-editor/react';
import ReactFlow, { MiniMap } from 'react-flow-renderer';
import grammar from './dsl.jison';
import logo from './logo.png';
import SplitPane, { Pane } from 'split-pane-react';
import 'split-pane-react/esm/themes/default.css';

const { Header, Content } = Layout;

const App = () => {

	const [splitPaneSizes, setSplitPaneSizes] = useState([250, '30%', 'auto']);

	const editorOptions = {
		wordWrap: 'on',
		tabSize: 2,
		minimap: { enabled: false },
	};

	const defaultValue = 
`
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

Entity Region as R {}

Ref: Sales > Region
`;

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
								height="100%"
								defaultLanguage="text"
								defaultValue={defaultValue}
								options={editorOptions}
							/>
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
