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
  const debouncedSearch = useDebounce(filters.search, 300);

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
    <div className="bg-white p-4 rounded-lg border border-gray-200 space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-2">
          <Filter className="w-5 h-5 text-gray-400" />
          <h3 className="text-sm font-medium text-gray-900">Filters</h3>
        </div>
        
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={onClearFilters}
            className="text-gray-500 hover:text-gray-700"
          >
            <X className="w-4 h-4 mr-1" />
            Clear all
          </Button>
        )}
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* Search */}
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
          <Input
            placeholder="Search jobs..."
            value={filters.search}
            onChange={(e) => onFiltersChange({ search: e.target.value })}
            className="pl-10"
          />
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
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tags
        </label>
        <div className="flex flex-wrap gap-2">
          {JOB_TAGS.slice(0, 15).map(tag => (
            <button
              key={tag}
              onClick={() => handleTagToggle(tag)}
              className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium transition-colors ${
                filters.tags.includes(tag)
                  ? 'bg-primary-100 text-primary-800 border border-primary-200'
                  : 'bg-gray-100 text-gray-700 border border-gray-200 hover:bg-gray-200'
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
        <div className="pt-2 border-t border-gray-200">
          <div className="flex items-center space-x-2">
            <span className="text-sm text-gray-500">Active filters:</span>
            
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