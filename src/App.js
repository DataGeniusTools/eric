import React, { useState, useCallback } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { Input, Layout, Space } from 'antd';
import * as ohm from 'ohm-js';
import ReactFlow, { addEdge, applyNodeChanges, applyEdgeChanges, MiniMap, MarkerType, Controls, ConnectionMode } from 'react-flow-renderer'; // 'react-flow-renderer';
import 'reactflow/dist/style.css';
import grammar from './Ohm.js';
import logo from './logo.png';
import SplitPane, { Pane } from 'split-pane-react';
import 'split-pane-react/esm/themes/default.css';
import SimpleFloatingEdge from './SimpleFloatingEdge';
import CustomNode from './CustomNode';

const { Header, Content } = Layout;
const nodeTypes = {
	custom: CustomNode,
};
const edgeTypes = {
  floating: SimpleFloatingEdge,
};

const App = () => {
	const [code, setCode] = useState(null);
	const [matchResult, setMatchResult] = useState(null);
	const [splitPaneSizes, setSplitPaneSizes] = useState([250, '30%', 'auto']);
	const editorOptions = {
		wordWrap: 'on',
		tabSize: 2,
		minimap: { enabled: false },
	};

	const [nodes, setNodes] = useState();
	const [edges, setEdges] = useState();
	const onNodesChange = useCallback(
		(changes) => setNodes((nds) => applyNodeChanges(changes, nds)),
		[],
	);
	const onEdgesChange = useCallback(
		(changes) => setEdges((eds) => applyEdgeChanges(changes, eds)),
		[],
	);
	/*
	const onConnect = useCallback(
		(params) =>
		  setEdges((eds) =>
			addEdge({ ...params, type: 'floating', markerEnd: { type: MarkerType.Arrow } }, eds)
		  ),
		[]
	  );
	  */

	const handleEditorChange = (newCode, event) => {
		setCode(newCode);
		const g = ohm.grammar(grammar);

		/* semantic for toString */

		const semantics = g.createSemantics().addOperation('toString', {
			Statements(e) {
				return e.toString();
			},
			Statement(e) {
				return e.toString();
			},
			Statement_entityDeclaration(entity, ident, as, ident2, attributes) {
				if (as.numChildren > 0)
					return "Entity " + ident.toString() + " ↣ " + ident2.toString() + attributes.toString();
				else
					return "Entity " + ident.toString() + attributes.toString();
			},
			Statement_refDeclaration(ref, refelement) {
				return "Ref " + refelement.toString();
			},
			Refelement(e) {
				return e.toString();
			},
			Refelement_attributeRef(entity1, dot1, attribute1, greater, entity2, dot2, attribute2) {
				return entity1.toString() + "." + attribute1.toString() + " → " + entity2.toString() + "." + attribute2.toString();
			},
			Refelement_entityRef(entity1, greater, entity2) {
				return entity1.toString() + " → " + entity2.toString();
			},
			Attributes(open, e, close) {
				return " { " + e.toString() + " }";
			},
			Attribute(e, type, pk) {
				if (pk.numChildren > 0)
					return e.toString() + "🔑 " + type.toString();
				else
					return e.toString() + " " + type.toString();
			},
			datatype(e) {
				return e.toString();
			},
			ident(letter, alnum) {
				return this.sourceString;
			},
			_iter(...children) {
				return children.map(c => c.toString());
			},
			_terminal() {
				return this.sourceString;
			},
		});

		/* semantic for nodes */

		const semanticsNodes = g.createSemantics().addOperation('nodes', {
			Statements(e) {
				return {
					nodes: e.nodes().filter(n => n) // remove empty array elements
				}
			},
			Statement(e) {
				if (e.ctorName === 'Statement_entityDeclaration') {
					return e.nodes();
				}
			},
			Statement_entityDeclaration(entity, ident, as, ident2, attributes) {
				if (as.numChildren > 0)
					return {
						name: ident.nodes(),
						alias: ident2.nodes()[0],
						attributes: attributes.nodes()[0],
						hasAttributes: attributes.numChildren > 0 ? 'Y' : 'N'
					}
				else
					return {
						name: ident.nodes(),
						attributes: attributes.nodes()[0],
						hasAttributes: attributes.numChildren > 0 ? 'Y' : 'N'
					}
			},
			Attributes(open, e, close) {
				return e.nodes()
			},
			Attribute(e, type, pk) {
				return {
					name: e.nodes(),
					datatype: type.nodes()[0],
					isPrimaryKey: pk.numChildren > 0 ? 'Y' : 'N'
				}
			},
			datatype(e) {
				return e.nodes();
			},
			ident(letter, alnum) {
				return this.sourceString;
			},
			_iter(...children) {
				return children.map(c => c.nodes());
			},
			_terminal() {
				return this.sourceString;
			},
		});

		/* semantic for edges */

		const semanticsEdges = g.createSemantics().addOperation('edges', {
			Statements(e) {
				return {
					edges: e.edges().filter(n => n) // remove empty array elements
				}
			},
			Statement(e) {
				if (e.ctorName === 'Statement_refDeclaration') {
					return e.edges();
				}
			},
			Statement_refDeclaration(ref, refelement) {
				return refelement.edges();
			},
			Refelement(e) {
				return e.edges();
			},
			Refelement_attributeRef(entity1, dot1, attribute1, greater, entity2, dot2, attribute2) {
				return {
					from: entity1.edges(),
					fromAttribute: attribute1.edges(),
					to: entity2.edges(),
					toAttribute: attribute2.edges(),
					type: 'AttributeRef'
					//direction: greater
				}
			},
			Refelement_entityRef(entity1, greater, entity2) {
				return {
					from: entity1.edges(),
					to: entity2.edges(),
					type: 'EntityRef'
					//direction: greater
				}
			},
			datatype(e) {
				return e.edges();
			},
			ident(letter, alnum) {
				return this.sourceString;
			},
			_iter(...children) {
				return children.map(c => c.edges());
			},
			_terminal() {
				return this.sourceString;
			},
		});

		const result = g.match(newCode);
		if (result.succeeded()) {

			setMatchResult(semantics(result).toString());

			console.log("nodes");
			const nodes = semanticsNodes(result).nodes();
			console.log(nodes);
			console.log("edges");
			const edges = semanticsEdges(result).edges();
			console.log(edges);

			const flowNodes =
				nodes.nodes.map((node, i) => {
					return {
						id: node.alias ? node.alias : node.name,
						type: 'custom',
						data: { title: node.name, color: '#6FB1FC', attributes: node.attributes ? node.attributes : null }, // color wird aktuell nicht benutzt, aber später
						position: { x: 0, y: i * 100 }
					}
				})
				;
			console.log("flowNodes");
			console.log(flowNodes);
			setNodes(flowNodes);
			// todo: keep position if nodes already exist
			// todo: custom nodes if entity has attributes 

			const flowEdges =
				edges.edges.map((edge, i) => {
					return {
						id: edge.from + "-" + edge.to,
						source: edge.from, // todo: attribute ref /// alias vs. name
						target: edge.to, // todo: attribute ref /// alias vs. name
						markerEnd: {
							type: MarkerType.Arrow,
						},
						label: edge.name,
						//type: 'floating'
						type: 'smoothstep' // https://reactflow.dev/examples/edges/edge-types
					}
				})
				;
			console.log("flowEdges");
			console.log(flowEdges);
			setEdges(flowEdges);

		} else {
			setMatchResult(result.shortMessage);
		}
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
						<ReactFlow
							nodes={nodes}
							onNodesChange={onNodesChange}
							edges={edges}
							onEdgesChange={onEdgesChange}
							//onConnect={onConnect}
							fitView
							nodeTypes={nodeTypes}
							edgeTypes={edgeTypes}
							connectionMode={ConnectionMode.Loose}
							style={{ height: '100%', border: '1px solid #e5e5e5', backgroundColor: '#fff' }}
						>
							<Controls position="bottom-right" />
							<MiniMap />
						</ReactFlow>
					</Pane>
				</SplitPane>
			</Content>
		</Layout>
	);
};

export default App;
