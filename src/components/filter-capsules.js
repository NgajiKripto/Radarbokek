/**
 * Filter capsules component for buyer map
 * Buttons: Semua, Bisa QRIS, Lagi Mangkal, Terdekat
 */

const FILTERS = [
  { id: 'all', label: 'Semua' },
  { id: 'qris', label: 'Bisa QRIS' },
  { id: 'mangkal', label: 'Lagi Mangkal' },
  { id: 'nearest', label: 'Terdekat' },
];

/**
 * Initialize filter capsules
 * @param {string} containerId - Container element ID
 * @param {Function} onChange - Called with selected filter id
 * @returns {{ getFilter: Function, setFilter: Function }}
 */
export function initFilterCapsules(containerId, onChange) {
  const container = document.getElementById(containerId);
  if (!container) return null;

  let activeFilter = 'all';

  function renderButtons() {
    container.innerHTML = FILTERS.map((f) => {
      const isActive = f.id === activeFilter;
      return `<button class="filter-capsule ${isActive ? 'filter-capsule--active' : 'filter-capsule--inactive'}" data-filter="${f.id}">${f.label}</button>`;
    }).join('');

    // Attach listeners
    container.querySelectorAll('.filter-capsule').forEach((btn) => {
      btn.addEventListener('click', () => {
        activeFilter = btn.dataset.filter;
        renderButtons();
        onChange(activeFilter);
      });
    });
  }

  renderButtons();

  return {
    getFilter: () => activeFilter,
    setFilter: (id) => {
      activeFilter = id;
      renderButtons();
    },
  };
}
