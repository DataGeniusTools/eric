import React, { useState, useCallback, useRef, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { Tooltip, Input, Layout, Space, Typography } from 'antd';
import { GithubOutlined, ForkOutlined, BorderOuterOutlined } from '@ant-design/icons';
import * as ohm from 'ohm-js';
import ReactFlow, { ReactFlowProvider, MiniMap, Controls, ControlButton, ConnectionMode, useReactFlow, useNodesState, useEdgesState, applyNodeChanges } from 'react-flow-renderer';
import 'reactflow/dist/style.css';
import grammar from './Ohm.js';
import logo from './logo.png';
import SplitPane, { Pane } from 'split-pane-react';
import 'split-pane-react/esm/themes/default.css';
import SimpleFloatingEdge from './SimpleFloatingEdge';
import CustomNode from './components/CustomNode';
import ELK from 'elkjs/lib/elk.bundled.js';
import DownloadButton from './components/DownloadButton';
import { editorKeywords, editorOptions, languageDef, configuration } from './editor-config.js'

const { Link } = Typography;
const { Header, Content } = Layout;
const localStoragKeyFlow = 'eric-flow';
const localStoragKeyDSL = 'eric-dsl';
const nodeTypes = {
	custom: CustomNode,
};
const edgeTypes = {
	floating: SimpleFloatingEdge,
};
const elk = new ELK();
const elkOptions = {
	'elk.algorithm': 'layered',
	'elk.layered.spacing.nodeNodeBetweenLayers': '100',
	'elk.spacing.nodeNode': '80',
};
const getLayoutedElements = (nodes, edges, options = {}) => {
	const isHorizontal = options?.['elk.direction'] === 'RIGHT';
	const graph = {
		id: 'root',
		layoutOptions: options,
		children: nodes.map((node) => ({
			...node,
			// Adjust the target and source handle positions based on the layout
			// direction.
			targetPosition: isHorizontal ? 'left' : 'top',
			sourcePosition: isHorizontal ? 'right' : 'bottom',
			// Hardcode a width and height for elk to use when layouting.
			width: 150,
			height: 50,
		})),
		edges: edges,
	};

	return elk
		.layout(graph)
		.then((layoutedGraph) => ({
			nodes: layoutedGraph.children.map((node) => ({
				...node,
				// React Flow expects a position property on the node instead of `x`
				// and `y` fields.
				position: { x: node.x, y: node.y },
			})),

			edges: layoutedGraph.edges,
		}))
		.catch(console.error);
};

function hasDuplicates(array) {
	for (let i = 0; i < array.length; i++) {
		for (let j = i + 1; j < array.length; j++) {
			if (array[i].alias === array[j].alias)
				return array[i].alias;
		}
	}
	return "";
}

const App = () => {
	const { fitView } = useReactFlow();
	const [code, setCode] = useState(null);
	const [matchResult, setMatchResult] = useState(null);
	const [splitPaneSizes, setSplitPaneSizes] = useState([250, '30%', 'auto']);
	const monacoRef = useRef(null);
	const monacoEditorRef = useRef(null);

	const editorWillMount = (monaco) => {
		//this.editor = monaco
		if (!monaco.languages.getLanguages().some(({ id }) => id === 'eric')) {
			// Register a new language
			monaco.languages.register({ id: 'eric' })
			// Register a tokens provider for the language
			monaco.languages.setMonarchTokensProvider('eric', languageDef)
			// Set the editing configuration for the language
			monaco.languages.setLanguageConfiguration('eric', configuration)
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
			})
		}
	}

	const editorOnMount = (editor, monaco) => {
		monacoRef.current = monaco;
		monacoEditorRef.current = editor;
	}

	const [nodes, setNodes] = useNodesState();
	const [edges, setEdges, onEdgesChange] = useEdgesState();
	const [rfInstance, setRfInstance] = useState(null);

	//const { setViewport } = useReactFlow();
	/*
	const onConnect = useCallback(
		(params) =>
		  setEdges((eds) =>
			addEdge({ ...params, type: 'floating', markerEnd: { type: MarkerType.Arrow } }, eds)
		  ),
		[]
	  );
	  */

	const saveToLocalStorage = useCallback(() => {
		// console.log("saveToLocalStorage");
		if (rfInstance) {
			// console.log("go...");
			// save flow 
			const flow = rfInstance.toObject();
			localStorage.setItem(localStoragKeyFlow, JSON.stringify(flow));
			// save dsl
			const dsl = code;
			localStorage.setItem(localStoragKeyDSL, dsl);
		}
	}, [code, rfInstance]);

	const readFromLocalStorage = useCallback(() => {
		const restoreFlow = async () => {
			// read flow
			const flow = JSON.parse(localStorage.getItem(localStoragKeyFlow));
			// read dsl
			const dsl = localStorage.getItem(localStoragKeyDSL);
			setCode(dsl);

			if (flow) {
				//const { x = 0, y = 0, zoom = 1 } = flow.viewport;
				setNodes(flow.nodes || []);
				setEdges(flow.edges || []);
				//setViewport({ x, y, zoom });
				fitView();
			}
		};
		restoreFlow();
	}, [setNodes, setEdges, fitView]);

	// save to local storage after each change in flow (e.g. nodes moved)
	const onNodesChange = useCallback(
		(changes) => {
			setNodes((nds) => applyNodeChanges(changes, nds));
			saveToLocalStorage();
		}, [setNodes, saveToLocalStorage]);

	// read only once after init from local storage (dsl and flow)
	useEffect(() => {
		readFromLocalStorage();
	}, [readFromLocalStorage]);

	const onLayout = useCallback(
		({ direction, useInitialNodes = false }) => {
			const opts = { 'elk.direction': direction, ...elkOptions };
			const ns = nodes;
			const es = edges;
			//const ns = useInitialNodes ? initialNodes : nodes;
			//const es = useInitialNodes ? initialEdges : edges;

			getLayoutedElements(ns, es, opts).then(({ nodes: layoutedNodes, edges: layoutedEdges }) => {
				setNodes(layoutedNodes);
				setEdges(layoutedEdges);

				window.requestAnimationFrame(() => fitView());

				saveToLocalStorage();
			});

		},
		[nodes, edges, fitView, setNodes, setEdges, saveToLocalStorage]
	);


	// Minimap support for Toolbar
	const [showMiniMap, setShowMiniMap] = useState(false);
	const toggleMiniMap = () => {
		setShowMiniMap(!showMiniMap);
	};
	const handleEditorChange = (newCode, event) => {

		setCode(newCode);

		saveToLocalStorage();

		const g = ohm.grammar(grammar);
		/* Semantic for toString */
		const semantics = g.createSemantics().addOperation('toString', {
			Statements(e) {
				return e.toString();
			},
			Statement(e) {
				return e.toString();
			},
			EntityDeclaration(entity, name, as, alias, attributes) {
				var name1 = name.toString();
				if (as.numChildren > 0)
					name1 += " as " + alias.toString()[0];
				return "Entity " + name1 + attributes.toString();
			},
			Attributes(open, e, close) {
				return " { " + e.toString() + " }";
			},
			Attribute(name, type, pk) {
				if (pk.numChildren > 0)
					return name.toString() + "🔑 " + type.toString();
				else
					return name.toString() + " " + type.toString();
			},
			RefDeclaration(ref, refelement, refName) {
				if (refName.numChildren > 0)
					return "Ref " + refelement.toString() + " [ " + refName.toString() + " ]";
				else
					return "Ref " + refelement.toString();
			},
			RefElement(e) {
				return e.toString();
			},
			RefEntity(name1, greater, name2) {
				return name1.toString() + " → " + name2.toString();
			},
			RefAttribute(name11, dot11, name12, greater, name21, dot21, name22) {
				return name11.toString() + "." + name12.toString() + " → " + name21.toString() + "." + name22.toString();
			},
			RefName(as, name) {
				return name.sourceString;
			},
			Name(e) {
				return e.sourceString;
			},
			datatype(e) {
				return e.toString();
			},
			quotedident(quote1, name, quote2) {
				return "\"" + name.toString() + "\"";
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
		/* Semantic for nodes */
		const semanticsNodes = g.createSemantics().addOperation('nodes', {
			Statements(e) {
				return {
					nodes: e.nodes().filter(n => n) // remove empty array elements
				}
			},
			Statement(e) {
				if (e.ctorName === 'EntityDeclaration') {
					return e.nodes();
				}
			},
			EntityDeclaration(entity, name, as, alias, attributes) {
				var aliasName = name.nodes();
				if (alias.numChildren > 0) {
					aliasName = alias.nodes()[0];
				}
				return {
					name: name.nodes(),
					alias: aliasName,
					attributes: attributes.nodes()[0],
					hasAttributes: attributes.numChildren > 0 ? 'Y' : 'N'
				};
			},
			Attributes(open, e, close) {
				return e.nodes();
			},
			Attribute(name, type, pk) {
				return {
					name: name.nodes(),
					datatype: type.nodes()[0],
					isPrimaryKey: pk.numChildren > 0 ? 'Y' : 'N'
				};
			},
			Name(e) {
				return e.nodes();
			},
			datatype(e) {
				return e.nodes();
			},
			quotedident(quote1, name, quote2) {
				return name.sourceString;
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
		/* Semantic for edges */
		const semanticsEdges = g.createSemantics().addOperation('edges', {
			Statements(e) {
				return {
					edges: e.edges().filter(n => n) // remove empty array elements
				}
			},
			Statement(e) {
				if (e.ctorName === 'RefDeclaration') {
					return e.edges();
				}
			},
			RefDeclaration(ref, refelement, refName) {
				const name = refName.numChildren > 0 ? refName.edges() : '';
				return {
					name,
					...refelement.edges()
				};
			},
			RefElement(e) {
				return e.edges();
			},
			RefEntity(entity1, greater, entity2) {
				return {
					from: entity1.edges(),
					fromAttribute: null,
					to: entity2.edges(),
					toAttribute: null,
					type: 'EntityRef'
					//direction: greater
				};
			},
			RefAttribute(entity1, dot11, attribute1, greater, entity2, dot21, attribute2) {
				return {
					from: entity1.edges(),
					fromAttribute: attribute1.edges(),
					to: entity2.edges(),
					toAttribute: attribute2.edges(),
					type: 'AttributeRef'
					//direction: greater
				};
			},
			RefName(as, name) {
				return name.sourceString;
			},
			datatype(e) {
				return e.edges();
			},
			quotedident(quote1, name, quote2) {
				return name.sourceString;
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

			// delete existing markers for syntax errors
			monacoRef.current.editor.setModelMarkers(monacoEditorRef.current.getModel(), 'msg', []);

			setMatchResult(semantics(result).toString());
			//console.log("semNodes");
			const semNodes = semanticsNodes(result).nodes();
			//console.log(semNodes);
			//console.log("semEdges");
			const semEdges = semanticsEdges(result).edges();
			//console.log(semEdges);
			const flowNodes =
				semNodes.nodes.map((node, i) => {
					// Find node in existing nodes of the flow/graph (to get the current position because this should stay the same)
					var matchingNode = nodes && nodes.find(nodeFlow => node.alias === nodeFlow.id || node.name === nodeFlow.id);
					return {
						id: node.name,
						type: 'custom',
						data: { title: node.name, color: '#6FB1FC', attributes: node.attributes ? node.attributes : null }, // color wird aktuell nicht benutzt, aber später
						position: {
							x: matchingNode ? matchingNode.position.x : 0,
							y: matchingNode ? matchingNode.position.y : i * 75
						}
					}
				});
			//console.log("flowNodes");
			//console.log(flowNodes);
			setNodes(flowNodes);
			// todo: keep position if nodes already exist
			const flowEdges =
				semEdges.edges.map((edge, i) => {
					var from = edge.from;
					// Find node in nodes list
					var matchingNode = semNodes.nodes.find(node => node.alias === edge.from);
					// Use node name when alias found
					if (matchingNode && matchingNode.alias !== matchingNode.name)
						from = matchingNode.name;
					var to = edge.to;
					// Find node in nodes list
					matchingNode = semNodes.nodes.find(node => node.alias === edge.to);
					// Use node name when alias found
					if (matchingNode && matchingNode.alias !== matchingNode.name)
						to = matchingNode.name;
					return edge.type === 'EntityRef' ? {
						id: from + "-" + to,
						source: from,
						target: to,
						label: edge.name,
						//type: 'floating'
						type: 'smoothstep' // https://reactflow.dev/examples/edges/edge-types
					} : {
						id: from + "-" + to,
						source: from,
						target: to,
						sourceHandle: `${edge.from}-source-${edge.fromAttribute}`,
						targetHandle: `${edge.to}-target-${edge.toAttribute}`,
						label: edge.name,
						//type: 'floating'
						type: 'smoothstep' // https://reactflow.dev/examples/edges/edge-types
					}
				});
			//console.log("flowEdges");
			//console.log(flowEdges);
			setEdges(flowEdges);
			// Search for missing entities used in Refs
			const nodesArray = [];
			semNodes.nodes.forEach(node => {
				nodesArray.push(node.name);
			});
			semNodes.nodes.forEach(node => {
				nodesArray.push(node.alias);
			});
			semEdges.edges.forEach(edge => {
				if (!nodesArray.includes(edge.from) || !nodesArray.includes(edge.to)) {
					const missing = !nodesArray.includes(edge.from) ? edge.from : edge.to;
					setMatchResult("Error: Invalid Entity \"" + missing + "\" found in \"Ref " + edge.from + " > " + edge.to + "\"");
					return;
				}
			});
			// Search for duplicate nodes
			const s = hasDuplicates(semNodes.nodes);
			if (s.length > 0) {
				setMatchResult("Error: Duplicate entity \"" + s + "\" found");
				return;
			}

			saveToLocalStorage();

		} else {
			console.log(result.shortMessage);
			// try setting markers for syntax errors
			try {
				const failure = result.shortMessage;
				const line = parseInt(failure.substring(5, failure.indexOf("col") - 2));
				const col = parseInt(failure.substring(failure.indexOf("col") + 4, failure.indexOf(":")));
				const message = failure.substring(failure.indexOf(":") + 2);
				console.log("line: " + line);
				console.log("col: " + col);
				console.log("message: " + message);

				monacoRef.current.editor.setModelMarkers(monacoEditorRef.current.getModel(), 'msg', [{
					startLineNumber: line,
					startColumn: col,
					endLineNumber: line,
					endColumn: col + 5,
					message: message,
					severity: monacoRef.current.MarkerSeverity.Error,
				}])
			} catch (err) { }
			//set match result
			setMatchResult(result.shortMessage);
		}
	};

	return (
		<Layout style={{ minHeight: '100vh' }}>
			<Header>
				<Space size="middle">
					<img src={logo} alt="Logo" style={{ height: '32px', verticalAlign: 'middle' }} />
					<h1 style={{ color: '#fff', margin: 0, fontFamily: 'Inter', fontSize: '24px', fontWeight: '600' }}>ERic</h1>
				</Space>
				<Space style={{ float: 'right' }} >
					<Link href="https://github.com/treimers/eric" target="_blank">
						<Tooltip title="go to Github repository">
							<GithubOutlined style={{ color: '#fff', fontSize: '24px', verticalAlign: 'middle' }} />
						</Tooltip>
					</Link>
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
							value={code}
							options={editorOptions}
							onChange={handleEditorChange}
							language="eric"
							beforeMount={editorWillMount}
							onMount={editorOnMount}
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
							onInit={setRfInstance}
							//onConnect={onConnect}
							fitView
							nodeTypes={nodeTypes}
							edgeTypes={edgeTypes}
							connectionMode={ConnectionMode.Loose}
							style={{ height: '100%', border: '1px solid #e5e5e5', backgroundColor: '#fff', fontFamily: 'Inter, system-ui, Avenir, Helvetica, Arial, sans-serif' }}
						>
							<Controls position="bottom-right" >
								<ControlButton title="automatic layout" onClick={() => onLayout({ direction: 'RIGHT' })} >
									<ForkOutlined />
								</ControlButton>
								<ControlButton title="mini map" onClick={toggleMiniMap}>
									<BorderOuterOutlined />
								</ControlButton>
								<DownloadButton />
							</Controls>
							{showMiniMap && <MiniMap />}
						</ReactFlow>
					</Pane>
				</SplitPane>
			</Content>
		</Layout>
	);
};

/* ReactFlowProvider needed for usage of e.g. useReactFlow, otherwise error occurs - see: https://reactflow.dev/learn/troubleshooting#warning-seems-like-you-have-not-used-zustand-provider-as-an-ancestor */
/* This provider must completely encapsulate the App component */
const AppProvider = (props) => {
	return (
		<ReactFlowProvider>
			<App {...props} />
		</ReactFlowProvider>
	);
}

export default AppProvider;
