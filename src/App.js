/**
 * Main App component for ERic application
 * Clean Code implementation with separated concerns
 */

import React, { useState, useCallback, useEffect } from 'react';
import { Input, Layout, Space, Checkbox } from 'antd';
import { ReactFlowProvider, useReactFlow, useNodesState, useEdgesState, applyNodeChanges } from 'reactflow';
import SplitPane, { Pane } from 'split-pane-react';
import 'split-pane-react/esm/themes/default.css';
import logo from './logo.png';

// Custom hooks
import { useTour } from './hooks/useTour';
import { useEditor } from './hooks/useEditor';

// Components
import Toolbar from './components/Toolbar';
import Editor from './components/Editor';
import DiagramCanvas from './components/DiagramCanvas';
import TourComponent from './components/Tour';

// Utilities and services
import { parseDSL, createToStringSemantics } from './dsl/parser';
import { saveProjectToBrowser, loadProjectFromBrowser } from './services/storage';
import { getLayoutedElements } from './utils/layoutHelpers';
import { hasDuplicates } from './utils/arrayHelpers';

// Link is not used in this component
const { Header, Content } = Layout;

/**
 * Main App component
 * Handles the overall application state and coordinates between components
 */
const App = () => {
  // React Flow hooks
  const { fitView } = useReactFlow();
  const [nodes, setNodes] = useNodesState();
  const [edges, setEdges, onEdgesChange] = useEdgesState();

  // Application state
  const [code, setCode] = useState(null);
  const [flow, setFlow] = useState(null);
  const [matchResult, setMatchResult] = useState(null);
  const [splitPaneSizes, setSplitPaneSizes] = useState([250, '30%', 'auto']);

  // Custom hooks
  const tour = useTour();
  const editor = useEditor();

  /**
   * Saves current project state to localStorage
   */
  const saveToLocalStorage = useCallback(() => {
    const flowData = { nodes, edges };
    setFlow(flowData);
    saveProjectToBrowser(flowData, code);
  }, [code, nodes, edges]);

  /**
   * Loads project state from localStorage
   */
  const readFromLocalStorage = useCallback(() => {
    const { flow: savedFlow, dsl: savedDsl } = loadProjectFromBrowser();
    
    setCode(savedDsl);
    if (savedFlow) {
      setFlow(savedFlow);
      setNodes(savedFlow.nodes || []);
      setEdges(savedFlow.edges || []);
      // Delay fitView to ensure nodes are rendered
      setTimeout(() => fitView(), 100);
    }
  }, [setNodes, setEdges, fitView]);

  /**
   * Handles node changes and saves to localStorage
   */
  const onNodesChange = useCallback(
    (changes) => {
      setNodes((nds) => applyNodeChanges(changes, nds));
      saveToLocalStorage();
    }, 
    [setNodes,saveToLocalStorage]
  );

  /**
   * Loads project from localStorage on initial render
   */
  useEffect(() => {
    readFromLocalStorage();
  }, [readFromLocalStorage]);

  /**
   * Applies automatic layout to the diagram
   */
  const onLayout = useCallback(
    ({ direction, useInitialNodes = false }) => {
      const opts = { 'elk.direction': direction };
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

  /**
   * Handles flow editor changes (JSON view)
   */
  const handleFlowEditorChange = (newCode, event) => {
    try {
      const flowData = JSON.parse(newCode);
      if (flowData) {
        setFlow(flowData);
        setNodes(flowData.nodes || []);
        setEdges(flowData.edges || []);
        fitView();
      }
    } catch (error) {
      console.log(error);
      setMatchResult(error);
    }
  };

  /**
   * Handles DSL editor changes and parses the code
   */
  const handleEditorChange = (newCode, event) => {
    try {
      setCode(newCode);
      saveToLocalStorage();

      const result = parseDSL(newCode);
    
    if (result.success) {
      // Clear syntax error markers
      editor.clearEditorMarkers();
      
      // Get toString representation for display
      const toStringSemantics = createToStringSemantics();
      setMatchResult(toStringSemantics(result.matchResult).toString());
      
      // Convert to React Flow format while preserving positions
      const flowNodes = result.nodes.map((node, i) => {
        // Find node in existing nodes to preserve position
        const matchingNode = nodes && nodes.find(nodeFlow => 
          node.alias === nodeFlow.id || node.name === nodeFlow.id
        );
        return {
          id: node.name,
          type: 'custom',
          data: { 
            title: node.name, 
            color: '#6FB1FC', 
            attributes: node.attributes || null 
          },
          position: {
            x: matchingNode ? matchingNode.position.x : 0,
            y: matchingNode ? matchingNode.position.y : i * 75
          }
        };
      });
      
      // Validate entities used in references
      const nodesArray = [];
      if (result.nodes && Array.isArray(result.nodes)) {
        result.nodes.forEach(node => {
          nodesArray.push(node.name);
          nodesArray.push(node.alias);
        });
      }
      
      if (result.edges && Array.isArray(result.edges)) {
        result.edges.forEach(edge => {
          if (!nodesArray.includes(edge.from) || !nodesArray.includes(edge.to)) {
            const missing = !nodesArray.includes(edge.from) ? edge.from : edge.to;
            setMatchResult(`Error: Invalid Entity "${missing}" found in "Ref ${edge.from} > ${edge.to}"`);
            return;
          }
        });
      }
      
      // Check for duplicate nodes
      if (result.nodes && Array.isArray(result.nodes)) {
        const duplicate = hasDuplicates(result.nodes);
        if (duplicate.length > 0) {
          setMatchResult(`Error: Duplicate entity "${duplicate}" found`);
          return;
        }
      }
      
      // Validate attribute references
      if (result.edges && Array.isArray(result.edges)) {
        const entityMap = {};
        result.nodes.forEach(node => {
          entityMap[node.name] = node.attributes || [];
          if (node.alias && node.alias !== node.name) {
            entityMap[node.alias] = node.attributes || [];
          }
        });
        
        for (const edge of result.edges) {
          if (edge.toAttribute) {
            const targetEntity = edge.to;
            const targetAttributes = entityMap[targetEntity];
            
            if (!targetAttributes) {
              setMatchResult(`Error: Invalid Entity "${targetEntity}" found in "Ref ${edge.from} > ${edge.to}"`);
              return;
            }
            
            // Ensure targetAttributes is an array
            const attributesArray = Array.isArray(targetAttributes) ? targetAttributes : [targetAttributes];
            
            const attributeExists = attributesArray.some(attr => {
              const toAttributeValue = Array.isArray(edge.toAttribute) ? edge.toAttribute[0] : edge.toAttribute;
              return attr && attr.name === toAttributeValue;
            });
            
            if (!attributeExists) {
              setMatchResult(`Error: Invalid Attribute "${edge.toAttribute}" found in Entity "${targetEntity}"`);
              return;
            }
          }
          
          if (edge.fromAttribute) {
            const sourceEntity = edge.from;
            const sourceAttributes = entityMap[sourceEntity];
            
            if (!sourceAttributes) {
              setMatchResult(`Error: Invalid Entity "${sourceEntity}" found in "Ref ${edge.from} > ${edge.to}"`);
              return;
            }
            
            const fromAttributeValue = Array.isArray(edge.fromAttribute) ? edge.fromAttribute[0] : edge.fromAttribute;
            const attributeExists = sourceAttributes.some(attr => attr.name === fromAttributeValue);
            if (!attributeExists) {
              setMatchResult(`Error: Invalid Attribute "${edge.fromAttribute}" found in Entity "${sourceEntity}"`);
              return;
            }
          }
        }
      }
      
      // Only set nodes and edges if validation passes
      const flowEdges = result.edges.map((edge, i) => ({
        id: edge.from + "-" + edge.to,
        source: edge.from,
        target: edge.to,
        label: edge.name,
        type: 'smoothstep'
      }));
      
      setNodes(flowNodes);
      setEdges(flowEdges);

      saveToLocalStorage();
    } else {
      console.log(result.error);
      setMatchResult(result.error);
      
      // Set syntax error markers
      try {
        const failure = result.error;
        const line = parseInt(failure.substring(5, failure.indexOf("col") - 2));
        const col = parseInt(failure.substring(failure.indexOf("col") + 4, failure.indexOf(":")));
        const message = failure.substring(failure.indexOf(":") + 2);
        
        const model = editor.getEditorModel();
        if (model) {
          editor.setEditorMarkers(model, [{
            startLineNumber: line,
            startColumn: col,
            endLineNumber: line,
            endColumn: col + 5,
            message: message,
            severity: editor.getMonacoInstance()?.MarkerSeverity.Error,
          }]);
        }
      } catch (err) {
        // Ignore marker setting errors
      }
    }
  } catch (error) {
    console.error('Error in handleEditorChange:', error);
    setMatchResult(`Error: ${error.message}`);
  }
  };

  /**
   * Settings menu configuration
   */
  const settingsMenu = {
    items: [
      {
        key: '1',
        label: (
          <Checkbox
            checked={tour.isTourDisabled}
            onChange={(e) => {
              e.stopPropagation();
              tour.toggleTourDisabled();
            }}
          >
            Disable Tour on Start
          </Checkbox>
        ),
      },
    ],
  };

  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header>
        <Space size="middle">
          <img src={logo} alt="Logo" style={{ height: '32px', verticalAlign: 'middle' }} />
          <h1 style={{ color: '#fff', margin: 0, fontFamily: 'Inter', fontSize: '24px', fontWeight: '600' }}>
            ERic
          </h1>
        </Space>
        
        <Toolbar
          onTourClick={tour.openTour}
          tourButtonRef={tour.tourButtonTour}
          settingsButtonRef={tour.settingsButtonTour}
          gitLinkRef={tour.gitLinkTour}
          settingsMenu={settingsMenu}
        />
      </Header>
      
      <Content ref={tour.mainWindowTour} style={{ padding: '0px', height: 'calc(100vh - 100px)' }}>
        <SplitPane
          split='vertical'
          sizes={splitPaneSizes}
          onChange={setSplitPaneSizes}
        >
          <Pane minSize={150} maxSize='50%'>
            {/* Editor Panel */}
            <Editor
              code={code}
              flow={flow}
              onCodeChange={handleEditorChange}
              onFlowChange={handleFlowEditorChange}
              monacoEditorTour={tour.monacoEditorTour}
            />
            
            {/* Parse Result Area */}
            <div ref={tour.parseResultTour} style={{ marginTop: '24px', height: '10%' }}>
              <Input.TextArea
                value={matchResult ? matchResult.toString() : 'No match result'}
                placeholder="Match Result"
                autoSize={{ minRows: 3, maxRows: 6 }}
                readOnly
              />
            </div>
          </Pane>
          
          <Pane style={{ height: '100%', width: '100%' }}>
            {/* Diagram Canvas */}
            <DiagramCanvas
              nodes={nodes}
              edges={edges}
              onNodesChange={onNodesChange}
              onEdgesChange={onEdgesChange}
              onLayout={onLayout}
              reactFlowTour={tour.reactFlowTour}
            />
          </Pane>
        </SplitPane>
      </Content>
      
      {/* Tour Component */}
      <TourComponent
        isTourOpen={tour.isTourOpen}
        onTourClose={tour.closeTour}
        tourRefs={tour}
      />
    </Layout>
  );
};

/**
 * App Provider with React Flow Provider wrapper
 */
const AppProvider = (props) => {
  return (
    <ReactFlowProvider>
      <App {...props} />
    </ReactFlowProvider>
  );
};

export default AppProvider;
