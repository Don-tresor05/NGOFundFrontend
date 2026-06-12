import { CheckCircle, Circle } from 'lucide-react';

interface ComplianceItem {
  id: number;
  title: string;
  description: string;
  completed: boolean;
}

interface ComplianceChecklistProps {
  items: ComplianceItem[];
  onToggle: (id: number) => void;
}

export function ComplianceChecklist({ items, onToggle }: ComplianceChecklistProps) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <div
          key={item.id}
          className={`flex items-start gap-3 p-4 border rounded-lg cursor-pointer transition-colors
            ${item.completed 
              ? 'border-green-500 bg-green-50' 
              : 'border-gray-200 hover:border-gray-300'
            }`}
          onClick={() => onToggle(item.id)}
        >
          <div className="flex-shrink-0 mt-0.5">
            {item.completed ? (
              <CheckCircle size={20} className="text-green-600" />
            ) : (
              <Circle size={20} className="text-gray-400" />
            )}
          </div>
          <div className="flex-1">
            <div className={`font-semibold ${item.completed ? 'text-green-900' : 'text-gray-900'}`}>
              {item.title}
            </div>
            <div className="text-sm text-gray-600 mt-1">
              {item.description}
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}
