// App.js
import React from 'react';
import { Layout } from 'antd';
import MonacoEditor from '@monaco-editor/react';
import ReactFlow, { MiniMap } from 'react-flow-renderer';
import grammar from './dsl.jison';
import logo from './logo.png'; // Stellen Sie sicher, dass das Logo importiert wird

const { Header, Content } = Layout;

const App = () => {
	const editorOptions = {
		wordWrap: 'on',
		tabSize: 2, // Setzt die Tabulatorengröße auf 2 (oder eine andere gewünschte Größe)
		minimap: { enabled: false },
	};

	const defaultValue = `
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
							defaultValue={defaultValue}
							options={editorOptions} // Übergeben Sie die Editor-Optionen
						/>
					</div>
					{/* React Flow */}
					<div style={{ flex: 1 }}>
						<ReactFlow elements={[]} style={{ height: '600px', border: '1px solid #e5e5e5' }}>
							<MiniMap />
						</ReactFlow>
					</div>
				</div>
			</Content>
		</Layout>
	);
};

export default App;
