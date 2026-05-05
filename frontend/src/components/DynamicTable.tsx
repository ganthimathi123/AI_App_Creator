import React from 'react';
import type { Entity } from '../shared/schema';
import { Database, Settings } from 'lucide-react';

interface DynamicTableProps {
  entity: Entity;
  data: any[];
  isLoading?: boolean;
}

export const DynamicTable: React.FC<DynamicTableProps> = ({ entity, data, isLoading }) => {
  if (isLoading) return (
    <div className="flex flex-col items-center justify-center p-20 space-y-4">
      <div className="w-12 h-12 border-4 border-emerald-500 border-t-transparent rounded-full animate-spin"></div>
      <p className="text-gray-500 font-medium">Fetching records...</p>
    </div>
  );

  if (data.length === 0) return (
    <div className="flex flex-col items-center justify-center p-20 text-center space-y-4">
      <div className="p-4 bg-gray-50 rounded-full">
        <Database size={48} className="text-gray-300" />
      </div>
      <div>
        <p className="text-xl font-bold text-gray-800">No {entity.label} records found</p>
        <p className="text-gray-500 max-w-xs mx-auto">Start by adding a new {entity.name.toLowerCase()} or importing data from a CSV file.</p>
      </div>
    </div>
  );

  return (
    <div className="overflow-hidden rounded-xl">
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse">
          <thead>
            <tr className="bg-slate-50">
              {entity.fields.map(field => (
                <th key={field.name} className="px-6 py-4 text-xs font-bold text-gray-500 uppercase tracking-wider border-b border-gray-100">
                  {field.label}
                </th>
              ))}
              <th className="px-6 py-4 border-b border-gray-100"></th>
            </tr>
          </thead>
          <tbody className="divide-y divide-gray-100">
            {data.map((row, idx) => (
              <tr key={idx} className="hover:bg-emerald-50/30 transition-colors group">
                {entity.fields.map(field => (
                  <td key={field.name} className="px-6 py-4 text-sm text-gray-600 group-hover:text-emerald-700 transition-colors">
                    {field.type === 'boolean' ? (
                      <span className={`px-2 py-1 rounded-full text-xs font-bold ${row[field.name] ? 'bg-green-100 text-green-700' : 'bg-red-100 text-red-700'}`}>
                        {row[field.name] ? 'Yes' : 'No'}
                      </span>
                    ) : String(row[field.name] ?? '-')}
                  </td>
                ))}
                <td className="px-6 py-4 text-right">
                  <button className="text-gray-400 hover:text-emerald-600 transition-colors">
                    <Settings size={16} />
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};
