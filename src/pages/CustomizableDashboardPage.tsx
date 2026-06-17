import { useState } from 'react';
import { Eye, EyeOff, GripVertical, Save } from 'lucide-react';
import { Button } from '../components/Button';
import FundTrackingWidget from '../components/FundTrackingWidget';
import LiveActivityFeed from '../components/LiveActivityFeed';
import TransparencyScorecard from '../components/TransparencyScorecard';

interface Widget {
  id: string;
  name: string;
  component: React.ComponentType;
  visible: boolean;
  order: number;
}

export default function CustomizableDashboardPage() {
  const [widgets, setWidgets] = useState<Widget[]>([
    { id: 'fund-tracking', name: 'Fund Tracking', component: FundTrackingWidget, visible: true, order: 1 },
    { id: 'activity-feed', name: 'Activity Feed', component: LiveActivityFeed, visible: true, order: 2 },
    { id: 'transparency', name: 'Transparency Scorecard', component: TransparencyScorecard, visible: true, order: 3 },
  ]);
  const [hasChanges, setHasChanges] = useState(false);

  const toggleWidget = (id: string) => {
    setWidgets(widgets.map(w => w.id === id ? { ...w, visible: !w.visible } : w));
    setHasChanges(true);
  };

  const moveWidget = (id: string, direction: 'up' | 'down') => {
    const index = widgets.findIndex(w => w.id === id);
    if ((direction === 'up' && index === 0) || (direction === 'down' && index === widgets.length - 1)) return;

    const newWidgets = [...widgets];
    const swapIndex = direction === 'up' ? index - 1 : index + 1;
    [newWidgets[index], newWidgets[swapIndex]] = [newWidgets[swapIndex], newWidgets[index]];
    
    // Update order
    newWidgets.forEach((w, i) => w.order = i + 1);
    
    setWidgets(newWidgets);
    setHasChanges(true);
  };

  const saveLayout = () => {
    // Save to localStorage (in real app, save to backend)
    localStorage.setItem('dashboardLayout', JSON.stringify(widgets));
    setHasChanges(false);
    alert('Dashboard layout saved!');
  };

  const visibleWidgets = widgets.filter(w => w.visible).sort((a, b) => a.order - b.order);

  return (
    <div className="max-w-7xl mx-auto p-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold">Customizable Dashboard</h1>
          <p className="text-gray-600 mt-1">Configure your personal dashboard layout</p>
        </div>
        <Button
          onClick={saveLayout}
          disabled={!hasChanges}
          className="flex items-center gap-2"
        >
          <Save size={18} /> Save Layout
        </Button>
      </div>

      {hasChanges && (
        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-6">
          <p className="text-yellow-800 font-medium">⚠️ You have unsaved layout changes</p>
        </div>
      )}

      {/* Widget Controls */}
      <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
        <h2 className="font-semibold mb-4">Widget Controls</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {widgets.map((widget, index) => (
            <div
              key={widget.id}
              className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50"
            >
              <div className="flex items-center gap-3">
                <div className="flex flex-col gap-1">
                  <button
                    onClick={() => moveWidget(widget.id, 'up')}
                    disabled={index === 0}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    ▲
                  </button>
                  <button
                    onClick={() => moveWidget(widget.id, 'down')}
                    disabled={index === widgets.length - 1}
                    className="text-gray-400 hover:text-gray-600 disabled:opacity-30"
                  >
                    ▼
                  </button>
                </div>
                <GripVertical size={18} className="text-gray-400" />
                <span className="font-medium">{widget.name}</span>
              </div>
              <button
                onClick={() => toggleWidget(widget.id)}
                className={`p-2 rounded-lg ${
                  widget.visible
                    ? 'bg-green-100 text-green-600 hover:bg-green-200'
                    : 'bg-gray-100 text-gray-400 hover:bg-gray-200'
                }`}
              >
                {widget.visible ? <Eye size={18} /> : <EyeOff size={18} />}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* Dashboard Preview */}
      <div className="space-y-6">
        <h2 className="text-xl font-semibold">Dashboard Preview</h2>
        {visibleWidgets.length === 0 ? (
          <div className="bg-gray-50 border-2 border-dashed border-gray-300 rounded-lg p-12 text-center">
            <p className="text-gray-500">No widgets visible. Enable widgets from the controls above.</p>
          </div>
        ) : (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {visibleWidgets.map((widget) => {
              const Component = widget.component;
              return (
                <div key={widget.id} className="widget-container">
                  <Component />
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Info Panel */}
      <div className="mt-6 bg-blue-50 border border-blue-200 rounded-lg p-4">
        <h3 className="font-semibold text-blue-900 mb-2">💡 Dashboard Tips</h3>
        <ul className="text-sm text-blue-800 space-y-1">
          <li>• Use ▲▼ buttons to reorder widgets</li>
          <li>• Click eye icon to show/hide widgets</li>
          <li>• Your layout preferences are saved per user</li>
          <li>• Widgets auto-refresh with real-time data</li>
        </ul>
      </div>
    </div>
  );
}
