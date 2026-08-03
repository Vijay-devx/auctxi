import React from 'react';
import { cn } from '../../utils/cn';
import EmptyState from './EmptyState';

/**
 * COMPONENT EXECUTION FLOW: DataTable
 * ---------------------------------------------------------
 * This is the smartest and most reusable UI component in the app.
 * It does not hardcode any data. Instead, parent pages (like PlayersList) pass down:
 * 1. `data`: An array of objects (the rows)
 * 2. `columns`: An array of configuration objects telling the table HOW to render each cell.
 */
const DataTable = ({
  columns = [],
  data = [],
  onRowClick,
  loading = false,
  emptyIcon,
  emptyTitle = 'No data available',
  emptyDescription = 'There are no records to display.',
}) => {
  if (loading) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden animate-pulse">
        <div className="h-12 bg-gray-50 border-b border-gray-100"></div>
        {[...Array(5)].map((_, i) => (
          <div key={i} className="flex h-16 items-center px-6 border-b border-gray-50">
            {columns.map((col, j) => (
              <div key={j} className={cn("h-4 bg-gray-200 rounded", j === 0 ? "w-1/4" : "w-1/6 ml-8")}></div>
            ))}
          </div>
        ))}
      </div>
    );
  }

  // STATE 2: If the fetch completed but the array is empty, render the EmptyState fallback
  if (!data || data.length === 0) {
    return (
      <div className="rounded-xl border border-gray-100 bg-white shadow-sm">
        <EmptyState icon={emptyIcon} title={emptyTitle} description={emptyDescription} />
      </div>
    );
  }

  // STATE 3: Data exists! Render the actual HTML table.
  return (
    <div className="rounded-xl border border-gray-100 bg-white shadow-sm overflow-hidden">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-gray-200">
          
          {/* THE HEADER ROW */}
          <thead className="bg-gray-50">
            <tr>
              {columns.map((col, index) => (
                <th
                  key={col.key || col.accessorKey || index}
                  scope="col"
                  className={cn(
                    "px-6 py-3 text-left text-[11px] font-semibold uppercase tracking-wider text-gray-500",
                    col.className
                  )}
                  style={col.width ? { width: col.width } : {}}
                >
                  {col.label || col.header}
                </th>
              ))}
            </tr>
          </thead>
          
          {/* THE DATA ROWS */}
          <tbody className="divide-y divide-gray-100 bg-white">
            {/* Loop through every object in the `data` array */}
            {data.map((row, rowIndex) => (
              <tr
                key={row.id || rowIndex}
                onClick={() => onRowClick && onRowClick(row)}
                className={cn(
                  "transition-colors hover:bg-gray-50/80",
                  onRowClick && "cursor-pointer"
                )}
              >
                {/* For each row, loop through every column configuration */}
                {columns.map((col, colIndex) => {
                  // Extract the raw string/number value from the row object
                  const cellValue = row[col.key || col.accessorKey || col.id];
                  
                  return (
                    <td
                      key={`${rowIndex}-${col.key || col.accessorKey || colIndex}`}
                      className={cn(
                        "whitespace-nowrap px-6 py-4 text-sm",
                        colIndex === 0 ? "font-medium text-gray-900" : "text-gray-500",
                        col.cellClassName
                      )}
                    >
                      {/* 
                        DYNAMIC CELL RENDERING LOGIC:
                        1. Does the parent page provide a custom `render(val, row)` function? Call it!
                        2. If not, does it provide a TanStack-style `cell()` function? Call it!
                        3. If not, just print the raw text value directly to the screen.
                      */}
                      {col.render 
                        ? col.render(cellValue, row) 
                        : col.cell 
                          ? col.cell({ row: { original: row }, getValue: () => cellValue }) 
                          : cellValue}
                    </td>
                  );
                })}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default DataTable;
// Vite HMR Refresh
