/**
 * Search bar component for buyer map
 */

/**
 * Initialize search bar with debounced callback
 * @param {string} inputId - Input element ID
 * @param {Function} onSearch - Called with search query string
 * @param {number} [debounceMs=300]
 * @returns {{ getValue: Function, setValue: Function, clear: Function }}
 */
export function initSearchBar(inputId, onSearch, debounceMs = 300) {
  const input = document.getElementById(inputId);
  if (!input) return null;

  let timeout = null;

  input.addEventListener('input', () => {
    clearTimeout(timeout);
    timeout = setTimeout(() => {
      onSearch(input.value.trim());
    }, debounceMs);
  });

  // Clear on Escape
  input.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
      input.value = '';
      onSearch('');
    }
  });

  return {
    getValue: () => input.value.trim(),
    setValue: (val) => { input.value = val; },
    clear: () => {
      input.value = '';
      onSearch('');
    },
  };
}
