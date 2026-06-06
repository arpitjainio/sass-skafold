import React, { useState, useMemo } from 'react';
import { Search, MoreHorizontal, Edit, Trash2, Eye } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from './card';
import { Button } from './forms/button';
import { Input } from './forms/input';
import { Select } from './forms/select';
import { Checkbox } from './forms/checkbox';

export interface DataTableColumn<T> {
  key: keyof T;
  header: string;
  render?: (value: T[keyof T], row: T) => React.ReactNode;
  sortable?: boolean;
}

export interface DataTableProps<T> {
  data: T[];
  columns: DataTableColumn<T>[];
  title: string;
  searchPlaceholder?: string;
  filters?: {
    key: string;
    label: string;
    options: { value: string; label: string }[];
  }[];
  onSearch?: (term: string) => void;
  onFilter?: (key: string, value: string) => void;
  onEdit?: (row: T) => void;
  onDelete?: (row: T) => void;
  onView?: (row: T) => void;
  selectable?: boolean;
  onSelectionChange?: (selectedIds: (string | number)[]) => void;
  loading?: boolean;
}

export function DataTable<T extends { id: string | number }>({
  data,
  columns,
  title,
  searchPlaceholder = "Search...",
  filters = [],
  onSearch,
  onFilter,
  onEdit,
  onDelete,
  onView,
  selectable = false,
  onSelectionChange,
  loading = false
}: DataTableProps<T>) {
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedFilters, setSelectedFilters] = useState<Record<string, string>>({});
  const [selectedRows, setSelectedRows] = useState<(string | number)[]>([]);

  const filteredData = useMemo(() => {
    let filtered = data;

    // Apply search
    if (searchTerm) {
      filtered = filtered.filter(row =>
        columns.some(column => {
          const value = row[column.key];
          return value && value.toString().toLowerCase().includes(searchTerm.toLowerCase());
        })
      );
    }

    // Apply filters
    Object.entries(selectedFilters).forEach(([key, value]) => {
      if (value && value !== 'All') {
        filtered = filtered.filter(row => {
          const rowValue = row[key as keyof T];
          return rowValue && rowValue.toString() === value;
        });
      }
    });

    return filtered;
  }, [data, searchTerm, selectedFilters, columns]);

  const handleSearch = (value: string) => {
    setSearchTerm(value);
    onSearch?.(value);
  };

  const handleFilter = (key: string, value: string) => {
    const newFilters = { ...selectedFilters, [key]: value };
    setSelectedFilters(newFilters);
    onFilter?.(key, value);
  };

  const handleSelectAll = () => {
    if (selectedRows.length === filteredData.length) {
      setSelectedRows([]);
      onSelectionChange?.([]);
    } else {
      const allIds = filteredData.map(row => row.id);
      setSelectedRows(allIds);
      onSelectionChange?.(allIds);
    }
  };

  const handleSelectRow = (id: string | number) => {
    const newSelection = selectedRows.includes(id)
      ? selectedRows.filter(rowId => rowId !== id)
      : [...selectedRows, id];
    setSelectedRows(newSelection);
    onSelectionChange?.(newSelection);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center justify-between text-gray-900 dark:text-white">
          <span>{title} ({filteredData.length})</span>
          {selectedRows.length > 0 && (
            <div className="flex items-center space-x-2">
              <span className="text-sm text-gray-500 dark:text-gray-400">
                {selectedRows.length} selected
              </span>
              {onEdit && (
                <Button variant="outline" size="sm">
                  <Edit className="w-4 h-4 mr-2" aria-hidden="true" />
                  Edit
                </Button>
              )}
              {onDelete && (
                <Button variant="outline" size="sm" className="text-red-600 hover:text-red-700">
                  <Trash2 className="w-4 h-4 mr-2" aria-hidden="true" />
                  Delete
                </Button>
              )}
            </div>
          )}
        </CardTitle>
      </CardHeader>
      <CardContent>
        {/* Search and Filters */}
        <div className="mb-6">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" aria-hidden="true" />
              <Input
                placeholder={searchPlaceholder}
                value={searchTerm}
                onChange={(e) => handleSearch(e.target.value)}
                className="pl-10"
              />
            </div>

            {/* Filters */}
            {filters.map((filter) => (
              <Select
                key={filter.key}
                value={selectedFilters[filter.key] || 'All'}
                onChange={(value) => handleFilter(filter.key, value as unknown as string)}
              >
                {filter.options.map(option => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            ))}
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead>
              <tr className="border-b border-gray-200 dark:border-gray-700">
                {selectable && (
                  <th className="text-left py-3 px-4">
                    <Checkbox
                      checked={selectedRows.length === filteredData.length && filteredData.length > 0}
                      onCheckedChange={handleSelectAll}
                    />
                  </th>
                )}
                {columns.map((column) => (
                  <th key={String(column.key)} className="text-left py-3 px-4 font-medium text-gray-900 dark:text-white">
                    {column.header}
                  </th>
                ))}
                {(onView || onEdit || onDelete) && (
                  <th className="text-right py-3 px-4 font-medium text-gray-900 dark:text-white">
                    Actions
                  </th>
                )}
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan={columns.length + (selectable ? 1 : 0) + ((onView || onEdit || onDelete) ? 1 : 0)} className="text-center py-8">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary-600 mx-auto"></div>
                  </td>
                </tr>
              ) : filteredData.length === 0 ? (
                <tr>
                  <td colSpan={columns.length + (selectable ? 1 : 0) + ((onView || onEdit || onDelete) ? 1 : 0)} className="text-center py-8 text-gray-500 dark:text-gray-400">
                    No data found
                  </td>
                </tr>
              ) : (
                filteredData.map((row) => (
                  <tr key={row.id} className="border-b border-gray-100 dark:border-gray-800 hover:bg-gray-50 dark:hover:bg-gray-700">
                    {selectable && (
                      <td className="py-3 px-4">
                        <Checkbox
                          checked={selectedRows.includes(row.id)}
                          onCheckedChange={() => handleSelectRow(row.id)}
                        />
                      </td>
                    )}
                    {columns.map((column) => (
                      <td key={String(column.key)} className="py-3 px-4">
                        {column.render ? column.render(row[column.key], row) : String(row[column.key] || '')}
                      </td>
                    ))}
                    {(onView || onEdit || onDelete) && (
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end space-x-2">
                          {onView && (
                            <button 
                              onClick={() => onView(row)}
                              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              aria-label="View"
                            >
                              <Eye className="w-4 h-4" aria-hidden="true" />
                            </button>
                          )}
                          {onEdit && (
                            <button 
                              onClick={() => onEdit(row)}
                              className="p-1 text-gray-400 hover:text-gray-600 dark:hover:text-gray-300"
                              aria-label="Edit"
                            >
                              <Edit className="w-4 h-4" aria-hidden="true" />
                            </button>
                          )}
                          {onDelete && (
                            <button 
                              onClick={() => onDelete(row)}
                              className="p-1 text-gray-400 hover:text-red-600"
                              aria-label="Delete"
                            >
                              <MoreHorizontal className="w-4 h-4" aria-hidden="true" />
                            </button>
                          )}
                        </div>
                      </td>
                    )}
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </CardContent>
    </Card>
  );
} 
