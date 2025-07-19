/**
 * Storage service for ERic application
 * Handles localStorage operations for project persistence
 */

const STORAGE_KEYS = {
  FLOW: 'eric-flow',
  DSL: 'eric-dsl',
  TOUR_DISABLED: 'disableTour'
};

/**
 * Saves project data to localStorage
 * @param {Object} flow - The React Flow data
 * @param {string} dsl - The DSL code
 */
export const saveProjectToBrowser = (flow, dsl) => {
  try {
    localStorage.setItem(STORAGE_KEYS.FLOW, JSON.stringify(flow));
    localStorage.setItem(STORAGE_KEYS.DSL, dsl);
  } catch (error) {
    console.error('Error saving project to localStorage:', error);
    throw error;
  }
};

/**
 * Loads project data from localStorage
 * @returns {Object} Object containing flow and dsl data
 */
export const loadProjectFromBrowser = () => {
  try {
    const flow = JSON.parse(localStorage.getItem(STORAGE_KEYS.FLOW));
    const dsl = localStorage.getItem(STORAGE_KEYS.DSL);
    
    return {
      flow: flow || null,
      dsl: dsl || null
    };
  } catch (error) {
    console.error('Error loading project from localStorage:', error);
    return { flow: null, dsl: null };
  }
};

/**
 * Clears all project data from localStorage
 */
export const clearProjectFromBrowser = () => {
  try {
    localStorage.removeItem(STORAGE_KEYS.FLOW);
    localStorage.removeItem(STORAGE_KEYS.DSL);
  } catch (error) {
    console.error('Error clearing project from localStorage:', error);
    throw error;
  }
};

/**
 * Gets all saved projects from localStorage
 * @returns {Array} Array of project names
 */
export const getAllProjectsFromBrowser = () => {
  try {
    const projects = [];
    for (let i = 0; i < localStorage.length; i++) {
      const key = localStorage.key(i);
      if (key && key.startsWith('eric-')) {
        projects.push(key);
      }
    }
    return projects;
  } catch (error) {
    console.error('Error getting projects from localStorage:', error);
    return [];
  }
};

/**
 * Deletes a specific project from localStorage
 * @param {string} projectName - The name of the project to delete
 */
export const deleteProjectFromBrowser = (projectName) => {
  try {
    localStorage.removeItem(projectName);
  } catch (error) {
    console.error('Error deleting project from localStorage:', error);
    throw error;
  }
};

/**
 * Saves tour preference to localStorage
 * @param {boolean} disabled - Whether the tour should be disabled
 */
export const saveTourPreference = (disabled) => {
  try {
    localStorage.setItem(STORAGE_KEYS.TOUR_DISABLED, JSON.stringify(disabled));
  } catch (error) {
    console.error('Error saving tour preference:', error);
    throw error;
  }
};

/**
 * Loads tour preference from localStorage
 * @returns {boolean} Whether the tour is disabled
 */
export const loadTourPreference = () => {
  try {
    const value = localStorage.getItem(STORAGE_KEYS.TOUR_DISABLED);
    return value ? JSON.parse(value) : false;
  } catch (error) {
    console.error('Error loading tour preference:', error);
    return false;
  }
}; 