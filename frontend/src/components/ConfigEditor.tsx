import React, { useState } from 'react';
import type { AppConfig } from '../shared/schema';

interface ConfigEditorProps {
  config: AppConfig;
  onSave: (newConfig: AppConfig) => void;
}

export const ConfigEditor: React.FC<ConfigEditorProps> = ({ config, onSave }) => {
  const [jsonStr, setJsonStr] = useState(JSON.stringify(config, null, 2));
  const [error, setError] = useState<string | null>(null);

  const handleSave = () => {
    try {
      const parsed = JSON.parse(jsonStr);
      onSave(parsed);
      setError(null);
    } catch (e: any) {
      setError(`Invalid JSON: ${e.message}`);
    }
  };

  return (
    <div className="flex flex-col h-full bg-slate-900 rounded-xl overflow-hidden shadow-2xl">
      <div className="bg-slate-800 px-6 py-4 flex items-center justify-between border-b border-slate-700">
        <h3 className="text-white font-semibold flex items-center gap-2">
          <span className="w-3 h-3 bg-green-500 rounded-full animate-pulse"></span>
          Live Config Editor
        </h3>
        <button 
          onClick={handleSave}
          className="bg-blue-600 hover:bg-blue-700 text-white px-4 py-1.5 rounded-lg text-sm font-medium transition-all shadow-md"
        >
          Apply Config
        </button>
      </div>
      <div className="flex-1 p-0 relative">
        <textarea
          className="w-full h-full bg-transparent text-blue-300 font-mono p-6 resize-none outline-none focus:ring-1 focus:ring-blue-500"
          value={jsonStr}
          onChange={(e) => setJsonStr(e.target.value)}
          spellCheck={false}
        />
        {error && (
          <div className="absolute bottom-4 left-4 right-4 bg-red-900/90 text-red-200 p-3 rounded-lg text-xs border border-red-700">
            {error}
          </div>
        )}
      </div>
    </div>
  );
};
