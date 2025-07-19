/**
 * Chat export utilities for ERic application
 * Helps preserve conversation history and project documentation
 */

/**
 * Exports the current conversation as a markdown file
 * @param {Object} conversationData - The conversation data to export
 * @param {string} filename - The filename for the export
 */
export const exportConversationAsMarkdown = (conversationData, filename = 'eric-conversation') => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const content = generateMarkdownContent(conversationData);
  const fullFilename = `${filename}-${timestamp}.md`;
  
  downloadFile(content, fullFilename, 'text/markdown');
};

/**
 * Exports the current project state with conversation context
 * @param {Object} projectData - The project data
 * @param {Object} conversationData - The conversation data
 * @param {string} filename - The filename for the export
 */
export const exportProjectWithContext = (projectData, conversationData, filename = 'eric-project') => {
  const timestamp = new Date().toISOString().replace(/[:.]/g, '-');
  const content = generateProjectContextContent(projectData, conversationData);
  const fullFilename = `${filename}-${timestamp}.md`;
  
  downloadFile(content, fullFilename, 'text/markdown');
};

/**
 * Generates markdown content from conversation data
 * @param {Object} conversationData - The conversation data
 * @returns {string} Markdown formatted conversation
 */
const generateMarkdownContent = (conversationData) => {
  const { title, messages, summary, todos } = conversationData;
  
  let content = `# ${title || 'ERic Development Conversation'}\n\n`;
  content += `**Date:** ${new Date().toLocaleDateString()}\n`;
  content += `**Time:** ${new Date().toLocaleTimeString()}\n\n`;
  
  if (summary) {
    content += `## Summary\n\n${summary}\n\n`;
  }
  
  if (todos && todos.length > 0) {
    content += `## Current Todos\n\n`;
    todos.forEach(todo => {
      const status = todo.status === 'completed' ? '✅' : todo.status === 'in_progress' ? '🔄' : '⏳';
      content += `- ${status} ${todo.content}\n`;
    });
    content += `\n`;
  }
  
  content += `## Conversation History\n\n`;
  
  messages.forEach((message, index) => {
    const role = message.role === 'user' ? '👤 User' : '🤖 Assistant';
    content += `### ${role} (Message ${index + 1})\n\n`;
    content += `${message.content}\n\n`;
    
    if (message.timestamp) {
      content += `*${message.timestamp}*\n\n`;
    }
    
    content += `---\n\n`;
  });
  
  return content;
};

/**
 * Generates project context content with conversation
 * @param {Object} projectData - The project data
 * @param {Object} conversationData - The conversation data
 * @returns {string} Markdown formatted project with context
 */
const generateProjectContextContent = (projectData, conversationData) => {
  const { dsl, flow, matchResult } = projectData;
  
  let content = `# ERic Project Export\n\n`;
  content += `**Export Date:** ${new Date().toLocaleDateString()}\n`;
  content += `**Export Time:** ${new Date().toLocaleTimeString()}\n\n`;
  
  // Project State
  content += `## Current Project State\n\n`;
  
  if (dsl) {
    content += `### DSL Code\n\n\`\`\`eric\n${dsl}\n\`\`\`\n\n`;
  }
  
  if (matchResult) {
    content += `### Parse Result\n\n\`\`\`\n${matchResult}\n\`\`\`\n\n`;
  }
  
  if (flow) {
    content += `### Flow Data\n\n\`\`\`json\n${JSON.stringify(flow, null, 2)}\n\`\`\`\n\n`;
  }
  
  // Conversation Context
  if (conversationData) {
    content += `## Development Context\n\n`;
    content += generateMarkdownContent(conversationData);
  }
  
  return content;
};

/**
 * Creates a conversation summary for quick reference
 * @param {Object} conversationData - The conversation data
 * @returns {string} Summary text
 */
export const createConversationSummary = (conversationData) => {
  const { messages, todos } = conversationData;
  
  let summary = `## Quick Summary\n\n`;
  summary += `**Total Messages:** ${messages.length}\n`;
  summary += `**Active Todos:** ${todos ? todos.filter(t => t.status !== 'completed').length : 0}\n\n`;
  
  if (todos && todos.length > 0) {
    summary += `### Current Tasks\n\n`;
    todos.filter(t => t.status !== 'completed').forEach(todo => {
      summary += `- ${todo.content}\n`;
    });
    summary += `\n`;
  }
  
  return summary;
};

/**
 * Imports conversation data from a file
 * @param {File} file - The file to import
 * @returns {Promise<Object>} Parsed conversation data
 */
export const importConversationFromFile = async (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    
    reader.onload = (e) => {
      try {
        const content = e.target.result;
        // Parse markdown content back to conversation data
        const conversationData = parseMarkdownToConversation(content);
        resolve(conversationData);
      } catch (error) {
        reject(error);
      }
    };
    
    reader.onerror = () => reject(new Error('Failed to read file'));
    reader.readAsText(file);
  });
};

/**
 * Parses markdown content back to conversation data
 * @param {string} content - The markdown content
 * @returns {Object} Parsed conversation data
 */
const parseMarkdownToConversation = (content) => {
  // This is a simplified parser - in a real implementation,
  // you might want to use a proper markdown parser
  const lines = content.split('\n');
  const conversationData = {
    title: '',
    messages: [],
    summary: '',
    todos: []
  };
  
  let currentSection = '';
  let currentMessage = null;
  
  for (const line of lines) {
    if (line.startsWith('# ')) {
      conversationData.title = line.substring(2);
    } else if (line.startsWith('## Summary')) {
      currentSection = 'summary';
    } else if (line.startsWith('## Conversation History')) {
      currentSection = 'messages';
    } else if (line.startsWith('### 👤 User') || line.startsWith('### 🤖 Assistant')) {
      if (currentMessage) {
        conversationData.messages.push(currentMessage);
      }
      currentMessage = {
        role: line.includes('User') ? 'user' : 'assistant',
        content: '',
        timestamp: null
      };
    } else if (currentMessage && line.trim() && !line.startsWith('---')) {
      currentMessage.content += line + '\n';
    }
  }
  
  if (currentMessage) {
    conversationData.messages.push(currentMessage);
  }
  
  return conversationData;
};

// Import the downloadFile function from fileHelpers
import { downloadFile } from './fileHelpers.js'; 