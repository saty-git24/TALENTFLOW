import React from 'react';
import { Search, Filter, X } from 'lucide-react';
import { Input } from '../../../components/ui/Input.jsx';
import { Select } from '../../../components/ui/Select.jsx';
import { Button } from '../../../components/ui/Button.jsx';
import { Badge } from '../../../components/ui/Badge.jsx';
import { JOB_TAGS } from '../../../utils/constants.js';
import { useDebounce } from '../../../hooks/useDebounce.js';

export const JobFilters = ({
  filters,
  onFiltersChange,
  onClearFilters
}) => {
  // 🔹 Local state for search input
  const [searchTerm, setSearchTerm] = React.useState(filters.search || "");

  // 🔹 Debounced value
  const debouncedSearch = useDebounce(searchTerm, 300);

  // 🔹 Push debounced search up to parent
  React.useEffect(() => {
    if (debouncedSearch !== filters.search) {
      onFiltersChange({ search: debouncedSearch });
    }
  }, [debouncedSearch, filters.search, onFiltersChange]);

  const handleTagToggle = (tag) => {
    const newTags = filters.tags.includes(tag)
      ? filters.tags.filter(t => t !== tag)
      : [...filters.tags, tag];
    
    onFiltersChange({ tags: newTags });
  };

  const hasActiveFilters = filters.search || filters.status || filters.tags.length > 0;

  return (
    <div className="bg-white dark:bg-gray-800 p-6 rounded-xl border border-gray-200 dark:border-gray-700 space-y-6 shadow-sm">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Filter className="w-5 h-5 text-primary-500" />
          <h3 className="text-lg font-semibold text-gray-900 dark:text-gray-100">Filters</h3>
        </div>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-gray-500 dark:text-gray-400 hover:text-gray-700 dark:hover:text-gray-200"
          >
            <X className="w-4 h-4 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400 dark:text-gray-500 pointer-events-none" />
          <div className="relative w-full">
            <input
              type="text"
              placeholder="Search jobs..."
              value={searchTerm}
              onChange={e => setSearchTerm(e.target.value)}
              className="block w-full pl-10 pr-10 py-3 rounded-lg border border-white focus:border-primary-500 dark:border-gray-600 bg-transparent text-gray-900 dark:text-gray-100 placeholder-gray-500 dark:placeholder-gray-400 shadow-sm transition-all duration-200"
              style={{ boxSizing: 'border-box' }}
            />
            {searchTerm && (
              <button
                type="button"
                aria-label="Clear search"
                className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 focus:outline-none z-20"
                style={{ pointerEvents: 'auto' }}
                onClick={() => setSearchTerm("")}
                tabIndex={0}
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>

        {/* Status */}
        <Select
          placeholder="All statuses"
          value={filters.status}
          onChange={(e) => onFiltersChange({ status: e.target.value })}
          options={[
            { label: 'All statuses', value: '' },
            { label: 'Active', value: 'active' },
            { label: 'Archived', value: 'archived' }
          ]}
        />
      </div>

      {/* Tags */}
      <div>
        <label className="block text-sm font-semibold text-gray-700 dark:text-gray-300 mb-3">
          Filter by Skills & Technologies
          {filters.tags.length > 0 && (
            <span className="ml-2 text-xs text-primary-600 dark:text-primary-400">
              ({filters.tags.length} selected)
            </span>
          )}
        </label>
        <div className="flex flex-wrap gap-3">
          {JOB_TAGS.slice(0, 15).map(tag => (
            <button
              key={tag}
              onClick={() => handleTagToggle(tag)}
              className={`inline-flex items-center px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 border ${
                filters.tags.includes(tag)
                  ? 'bg-primary-100 dark:bg-primary-900/30 text-primary-800 dark:text-primary-300 border-primary-300 dark:border-primary-700 shadow-sm'
                  : 'bg-white dark:bg-gray-700 text-gray-700 dark:text-gray-300 border-gray-200 dark:border-gray-600 hover:bg-gray-50 dark:hover:bg-gray-600 hover:border-gray-300 dark:hover:border-gray-500'
              }`}
            >
              {tag}
              {filters.tags.includes(tag) && (
                <X className="w-3 h-3 ml-1" />
              )}
            </button>
          ))}
        </div>
      </div>

      {/* Active filters summary */}
      {hasActiveFilters && (
        <div className="pt-4 border-t border-gray-200 dark:border-gray-700">
          <div className="flex items-center flex-wrap gap-3">
            <span className="text-sm font-medium text-gray-600 dark:text-gray-400">Active filters:</span>
            
            {filters.search && (
              <Badge variant="secondary">
                Search: "{filters.search}"
              </Badge>
            )}
            
            {filters.status && (
              <Badge variant="secondary">
                Status: {filters.status}
              </Badge>
            )}
            
            {filters.tags.length > 0 && (
              <Badge variant="secondary">
                Tags: {filters.tags.length}
              </Badge>
            )}
          </div>
        </div>
      )}
    </div>
  );
};
