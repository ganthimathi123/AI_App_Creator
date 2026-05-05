import React, { useState } from 'react';
import type { Entity, Field } from '../shared/schema';

interface DynamicFormProps {
  entity: Entity;
  onSubmit: (data: any) => void;
  isLoading?: boolean;
}

export const DynamicForm: React.FC<DynamicFormProps> = ({ entity, onSubmit, isLoading }) => {
  const [formData, setFormData] = useState<any>({});

  const handleChange = (name: string, value: any) => {
    setFormData((prev: any) => ({ ...prev, [name]: value }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSubmit(formData);
  };

  const renderField = (field: Field) => {
    const commonProps = {
      id: field.name,
      name: field.name,
      required: field.required,
      placeholder: field.placeholder,
      className: "w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl focus:ring-2 focus:ring-emerald-500 focus:border-transparent outline-none transition-all placeholder:text-gray-400 text-gray-700",
      onChange: (e: any) => handleChange(field.name, e.target.value),
      value: formData[field.name] || '',
    };

    switch (field.type) {
      case 'textarea':
        return <textarea {...commonProps} rows={4} />;
      case 'select':
        return (
          <select {...commonProps}>
            <option value="">Select {field.label}</option>
            {field.options?.map(opt => (
              <option key={opt} value={opt}>{opt}</option>
            ))}
          </select>
        );
      case 'boolean':
        return (
          <div className="flex items-center gap-3 py-2">
            <input 
              type="checkbox" 
              checked={formData[field.name] || false}
              onChange={(e) => handleChange(field.name, e.target.checked)}
              className="w-5 h-5 text-emerald-600 border-gray-300 rounded focus:ring-emerald-500 cursor-pointer"
            />
            <span className="text-sm text-gray-600">Yes, it is {field.label.toLowerCase()}</span>
          </div>
        );
      default:
        return <input type={field.type} {...commonProps} />;
    }
  };

  return (
    <form onSubmit={handleSubmit} className="space-y-8 animate-fade-in">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-x-8 gap-y-6">
        {entity.fields.map((field) => (
          <div key={field.name} className="space-y-1.5">
            <label htmlFor={field.name} className="block text-sm font-semibold text-gray-700 ml-1">
              {field.label} {field.required && <span className="text-red-500">*</span>}
            </label>
            {renderField(field)}
          </div>
        ))}
      </div>
      <div className="pt-6 border-t border-gray-100 flex justify-end">
        <button
          type="submit"
          disabled={isLoading}
          className="bg-emerald-600 hover:bg-emerald-700 text-white font-bold py-3 px-10 rounded-xl transition-all shadow-lg shadow-emerald-200 hover:shadow-emerald-300 disabled:opacity-50 active:scale-95"
        >
          {isLoading ? 'Processing...' : `Save ${entity.label}`}
        </button>
      </div>
    </form>
  );
};
