/**
 * Array utility functions for ERic application
 */

/**
 * Checks if an array has duplicate aliases
 * @param {Array} array - Array of objects with alias property
 * @returns {string} Returns the duplicate alias or empty string if no duplicates
 */
export const hasDuplicates = (array) => {
  for (let i = 0; i < array.length; i++) {
    for (let j = i + 1; j < array.length; j++) {
      if (array[i].alias === array[j].alias) {
        return array[i].alias;
      }
    }
  }
  return "";
};

/**
 * Finds all duplicates in an array based on a key
 * @param {Array} array - Array to check for duplicates
 * @param {string} key - The key to check for duplicates
 * @returns {Array} Array of duplicate values
 */
export const findAllDuplicates = (array, key) => {
  const seen = new Set();
  const duplicates = new Set();
  
  array.forEach(item => {
    const value = item[key];
    if (seen.has(value)) {
      duplicates.add(value);
    } else {
      seen.add(value);
    }
  });
  
  return Array.from(duplicates);
};

/**
 * Removes duplicates from an array based on a key
 * @param {Array} array - Array to remove duplicates from
 * @param {string} key - The key to check for duplicates
 * @returns {Array} Array without duplicates
 */
export const removeDuplicates = (array, key) => {
  const seen = new Set();
  return array.filter(item => {
    const value = item[key];
    if (seen.has(value)) {
      return false;
    } else {
      seen.add(value);
      return true;
    }
  });
};

/**
 * Groups array items by a key
 * @param {Array} array - Array to group
 * @param {string} key - The key to group by
 * @returns {Object} Object with grouped items
 */
export const groupBy = (array, key) => {
  return array.reduce((groups, item) => {
    const group = item[key];
    if (!groups[group]) {
      groups[group] = [];
    }
    groups[group].push(item);
    return groups;
  }, {});
};

/**
 * Sorts array by multiple keys
 * @param {Array} array - Array to sort
 * @param {Array} sortKeys - Array of sort keys with direction ('asc' or 'desc')
 * @returns {Array} Sorted array
 */
export const sortByMultiple = (array, sortKeys) => {
  return array.sort((a, b) => {
    for (const { key, direction } of sortKeys) {
      const aVal = a[key];
      const bVal = b[key];
      
      if (aVal < bVal) {
        return direction === 'desc' ? 1 : -1;
      }
      if (aVal > bVal) {
        return direction === 'desc' ? -1 : 1;
      }
    }
    return 0;
  });
}; 