/**
 * File handling utilities for ERic application
 */

/**
 * Downloads a file with the given content and filename
 * @param {string} content - The file content to download
 * @param {string} filename - The filename for the download
 * @param {string} mimeType - The MIME type of the file
 */
export const downloadFile = (content, filename, mimeType = 'text/plain') => {
  const blob = new Blob([content], { type: mimeType });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
};

/**
 * Reads a file from input and returns its content
 * @param {File} file - The file to read
 * @returns {Promise<string>} The file content
 */
export const readFile = (file) => {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = (e) => resolve(e.target.result);
    reader.onerror = (e) => reject(e);
    reader.readAsText(file);
  });
};

/**
 * Creates a download for the current project state
 * @param {Object} projectData - The project data to download
 * @param {string} projectName - The name of the project
 */
export const downloadProject = (projectData, projectName) => {
  const content = JSON.stringify(projectData, null, 2);
  const filename = `${projectName}.json`;
  downloadFile(content, filename, 'application/json');
};

/**
 * Exports the current diagram as an image
 * @param {string} format - The image format ('png', 'jpg', 'svg')
 * @param {string} filename - The filename for the export
 */
export const exportDiagram = async (format = 'png', filename = 'eric-diagram') => {
  try {
    // This would need to be implemented with html-to-image or similar
    // For now, we'll create a placeholder
    console.log(`Exporting diagram as ${format}...`);
    // Implementation would go here
  } catch (error) {
    console.error('Error exporting diagram:', error);
    throw error;
  }
}; 