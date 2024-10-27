import React, { useState, useCallback, useRef, useEffect } from 'react';
import MonacoEditor from '@monaco-editor/react';
import { Tooltip, Input, Layout, Space, Typography, Button, Tour, Modal, Dropdown, Checkbox } from 'antd';
import { SettingOutlined, GithubOutlined, ForkOutlined, BorderOuterOutlined } from '@ant-design/icons';
import * as ohm from 'ohm-js';
import ReactFlow, { ReactFlowProvider, MiniMap, Controls, ControlButton, ConnectionMode, useReactFlow, useNodesState, useEdgesState, applyNodeChanges } from 'react-flow-renderer';
import 'reactflow/dist/style.css';
import grammar from './Ohm.js';
import logo from './logo.png';
import automaticlayout from './automaticlayout.png';
import fitview from './fitview.png';
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
	// Start tour code
	const [isTourOpen, setIsTourOpen] = useState(false);
	const [isTourDisabled, setIsTourDisabled] = useState(
		JSON.parse(localStorage.getItem('disableTour')) || false
	);
	const initialRender = useRef(true);
	useEffect(() => {
		if (initialRender.current) {
			initialRender.current = false;
			if (!isTourDisabled) {
				setIsTourOpen(true);
			}
		}
	}, [isTourDisabled]);
	const mainWindowTour = useRef(null);
	const monacoEditorTour = useRef(null);
	const reactFlowTour = useRef(null);
	const parseResultTour = useRef(null);
	const gitLinkTour = useRef(null);
	const tourButtonTour = useRef(null);
	const settingsButtonTour = useRef(null);
	const tourSteps = [
		{
			title: 'Welcome',
			description: <>
				Welcome to ERic, an interactive Entity Relationship creator!<br /><br />
				This tour will help you to understand the main elements of ERic.
			</>,
			target: null
		},
		{
			title: 'ER definition language',
			description: <>
				Enter here your entity relationship definition in the ERic language.<br /><br />
				Try it copy the example below into your clipboard and paste it into the code definition window.<br /><br />
				Entity Customer {'{'}<br />
				id int *<br />
				fname string<br />
				lname string<br />
				addressId int<br />
				{'}'}<br /><br />

				Entity Order {'{'}<br />
				id int *<br />
				customerId int<br />
				orderDate date<br />
				{'}'}<br /><br />

				Entity OrderLine {'{'}<br />
				position int *<br />
				orderId int<br />
				quantiy int<br />
				articleId int<br />
				{'}'}<br /><br />

				Entity Address {'{'}<br />
				id int *<br />
				zip string<br />
				street string<br />
				city string<br />
				{'}'}<br /><br />
	
				Ref Order.customerId > Customer.id<br />
				Ref OrderLine.orderId > Order.id<br />
				Ref Customer.addressId > Address.id
			</>,
			placement: 'right',
			target: () => monacoEditorTour.current
		},
		{
			title: 'ER diagram',
			description: <>
				Your ER diagram will be shown in this window.<br /><br />
				In the lower left corner there is a collection of buttons to adjust the diagram.<br /><br />
				Try the <b>automatic layout button</b> <img src={automaticlayout} alt="automatic layout" style={{ height: '12px' }} /> to arrange your diagram and the <b>fit view button</b> <img src={fitview} alt="fit view" style={{ height: '12px' }} /> afterwards to see the whole diagram<br /><br />
				Hover your mouse over each button to get a tooltip explaining its function.
			</>,
			placement: 'left',
			target: () => reactFlowTour.current
		},
		{
			title: 'Parse results',
			description: <>
				Parsing results will be displayed here.<br /><br />
				You should have a look to this area when your diagram is empty and check for any parsing errors displayed here.
			</>,
			placement: 'right',
			target: () => parseResultTour.current
		},
		{
			title: 'Tour',
			description: <>
				You can restart this tour with a click on this button.
			</>,
			placement: 'bottom',
			target: () => tourButtonTour.current
		},
		{
			title: 'Settings',
			description: <>
				You can enable or disable the automated tour start here.
			</>,
			placement: 'bottom',
			target: () => settingsButtonTour.current
		},
		{
			title: 'Github',
			description: <>
				Click on this icon to open the ERic Github page.<br /><br />
				You should get much more help how to use ERic, here a <a href="https://github.com/DataGeniusTools/eric/blob/master/doc/Userdoc.md" target="_blank" rel="noreferrer">direct link to the user manual.</a><br /><br />
				On the Github page a detailed description of ERic definition language grammar can be found <a href="https://github.com/DataGeniusTools/eric/blob/master/src/Ohm.js" target="_blank" rel="noreferrer">under this link</a> as well.
			</>,
			placement: 'bottom',
			target: () => gitLinkTour.current
		}
	];
	const handleTourClose = () => {
		setIsTourOpen(false);
		if (!isTourDisabled) {
			Modal.confirm({
				title: 'Tour',
				content: (
					<p>Disable Tour on Start?</p>
				),
				okText: 'Disable',
				cancelText: 'Keep',
				onOk: () => {
					const disableTour = !isTourDisabled;
					setIsTourDisabled(disableTour);
					localStorage.setItem('disableTour', JSON.stringify(disableTour));
				},
			});
		}
	};
	const settingsMenuItems = [
		{
			key: '1',
			label: (
				<Checkbox
					checked={!isTourDisabled}
					onChange={(e) => {
						const disableTour = !e.target.checked;
						setIsTourDisabled(disableTour);
						localStorage.setItem('disableTour', JSON.stringify(disableTour));
					}}
				>
					Show Tour on Start
				</Checkbox>
			),
		},
	];
	const settingsMenu = { items: settingsMenuItems };
	// End tour code
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
	const saveToLocalStorage = useCallback(() => {
		if (rfInstance) {
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
			const semNodes = semanticsNodes(result).nodes();
			const semEdges = semanticsEdges(result).edges();
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
				<Space size="middle" style={{ display: 'flex', justifyContent: 'space-between', width: '100%' }}>
					<div style={{ display: 'flex', alignItems: 'center' }}>
						<img src={logo} alt="Logo" style={{ height: '32px', verticalAlign: 'middle' }} />
						<h1 style={{ color: '#fff', margin: 0, fontFamily: 'Inter', fontSize: '24px', fontWeight: '600' }}>ERic</h1>
					</div>
					<div style={{ display: 'flex', alignItems: 'center' }}>
						<Button ref={tourButtonTour} type="primary" onClick={() => setIsTourOpen(true)}>
							Tour
						</Button>
						<Dropdown menu={settingsMenu} placement="bottomRight">
							<SettingOutlined ref={settingsButtonTour} style={{ color: '#fff', fontSize: '24px', marginLeft: '16px', cursor: 'pointer' }} />
						</Dropdown>
						<span ref={gitLinkTour} style={{ marginLeft: '16px' }}>
							<Link href="https://github.com/DataGeniusTools/eric" target="_blank">
								<Tooltip title="go to Github repository">
									<GithubOutlined style={{ color: '#fff', fontSize: '24px', verticalAlign: 'middle' }} />
								</Tooltip>
							</Link>
						</span>
					</div>
				</Space>
			</Header>
			<Content ref={mainWindowTour} style={{ padding: '0px', height: 'calc(100vh - 100px)' }}>
				<SplitPane
					split='vertical'
					sizes={splitPaneSizes}
					onChange={setSplitPaneSizes}
				>
					<Pane minSize={150} maxSize='50%'>
						{/* Monaco Editor */}
						<span ref={monacoEditorTour}>
							<MonacoEditor
								height="88%"
								value={code}
								options={editorOptions}
								onChange={handleEditorChange}
								language="eric"
								beforeMount={editorWillMount}
								onMount={editorOnMount}
							/>
						</span>
						{/* Textfield with matchResult */}
						<div ref={parseResultTour} style={{ marginTop: '24px' }}>
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
						<span ref={reactFlowTour}>
							<ReactFlow
								nodes={nodes}
								onNodesChange={onNodesChange}
								edges={edges}
								onEdgesChange={onEdgesChange}
								onInit={setRfInstance}
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
						</span>
					</Pane>
				</SplitPane>
			</Content>
			<Tour
				open={isTourOpen}
				onClose={handleTourClose}
				steps={tourSteps}
				indicatorsRender={(current, total) => (
					<span>
						{current + 1} / {total}
					</span>
				)}
			/>
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
