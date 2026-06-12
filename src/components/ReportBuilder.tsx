import { useState, useEffect } from 'react';
import { GripVertical, X, Plus } from 'lucide-react';

interface ReportField {
  id: string;
  label: string;
  category: string;
}

interface ReportBuilderProps {
  onSave?: (config: any) => void;
}

export function ReportBuilder({ onSave }: ReportBuilderProps) {
  const [availableFields, setAvailableFields] = useState<Record<string, string[]>>({});
  const [selectedFields, setSelectedFields] = useState<ReportField[]>([]);
  const [templateName, setTemplateName] = useState('');

  useEffect(() => {
    fetchAvailableFields();
  }, []);

  const fetchAvailableFields = async () => {
    try {
      const response = await fetch(
        `${import.meta.env.VITE_API_BASE_URL}/report-templates/available-fields/`,
        {
          headers: {
            Authorization: `Bearer ${localStorage.getItem('access_token')}`,
          },
        }
      );
      const data = await response.json();
      setAvailableFields(data);
    } catch (err) {
      console.error('Failed to fetch available fields:', err);
    }
  };

  const addField = (field: string, category: string) => {
    const newField: ReportField = {
      id: `${category}_${field}_${Date.now()}`,
      label: field.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase()),
      category,
    };
    setSelectedFields([...selectedFields, newField]);
  };

  const removeField = (id: string) => {
    setSelectedFields(selectedFields.filter(f => f.id !== id));
  };

  const moveField = (index: number, direction: 'up' | 'down') => {
    const newFields = [...selectedFields];
    const targetIndex = direction === 'up' ? index - 1 : index + 1;
    if (targetIndex < 0 || targetIndex >= newFields.length) return;
    [newFields[index], newFields[targetIndex]] = [newFields[targetIndex], newFields[index]];
    setSelectedFields(newFields);
  };

  const handleSave = async () => {
    const config = {
      name: templateName,
      template_config: {
        fields: selectedFields.map((f, idx) => ({
          field: f.label,
          category: f.category,
          order: idx,
        })),
      },
    };

    try {
      const response = await fetch(`${import.meta.env.VITE_API_BASE_URL}/report-templates/`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          Authorization: `Bearer ${localStorage.getItem('access_token')}`,
        },
        body: JSON.stringify(config),
      });

      if (response.ok) {
        onSave?.(config);
        alert('Report template saved successfully!');
      }
    } catch (err) {
      console.error('Failed to save template:', err);
    }
  };

  return (
    <div className="grid grid-cols-2 gap-6">
      {/* Available Fields */}
      <div className="space-y-4">
        <h3 className="font-semibold">Available Fields</h3>
        {Object.entries(availableFields).map(([category, fields]) => (
          <div key={category} className="border rounded-lg p-4">
            <h4 className="text-sm font-medium mb-2 text-gray-700">
              {category.replace(/_/g, ' ').replace(/\b\w/g, l => l.toUpperCase())}
            </h4>
            <div className="space-y-1">
              {fields.map(field => (
                <button
                  key={field}
                  onClick={() => addField(field, category)}
                  className="w-full text-left text-sm p-2 hover:bg-gray-50 rounded flex items-center justify-between group"
                >
                  <span>{field.replace(/_/g, ' ')}</span>
                  <Plus size={14} className="opacity-0 group-hover:opacity-100" />
                </button>
              ))}
            </div>
          </div>
        ))}
      </div>

      {/* Report Builder */}
      <div className="space-y-4">
        <div>
          <h3 className="font-semibold mb-2">Report Builder</h3>
          <input
            type="text"
            placeholder="Template Name"
            value={templateName}
            onChange={(e) => setTemplateName(e.target.value)}
            className="input-field w-full"
          />
        </div>

        <div className="border-2 border-dashed border-gray-300 rounded-lg p-4 min-h-[400px]">
          {selectedFields.length === 0 ? (
            <p className="text-center text-gray-400 py-12">
              Drag fields from the left or click to add
            </p>
          ) : (
            <div className="space-y-2">
              {selectedFields.map((field, index) => (
                <div
                  key={field.id}
                  className="bg-white border rounded-lg p-3 flex items-center justify-between group"
                >
                  <div className="flex items-center gap-3">
                    <GripVertical size={16} className="text-gray-400" />
                    <div>
                      <p className="font-medium text-sm">{field.label}</p>
                      <p className="text-xs text-gray-500">{field.category}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => moveField(index, 'up')}
                      disabled={index === 0}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      ↑
                    </button>
                    <button
                      onClick={() => moveField(index, 'down')}
                      disabled={index === selectedFields.length - 1}
                      className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                    >
                      ↓
                    </button>
                    <button
                      onClick={() => removeField(field.id)}
                      className="text-red-400 hover:text-red-600"
                    >
                      <X size={16} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <button
          onClick={handleSave}
          disabled={!templateName || selectedFields.length === 0}
          className="btn-primary w-full"
        >
          Save Report Template
        </button>
      </div>
    </div>
  );
}
