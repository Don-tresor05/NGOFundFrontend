import { useEffect, useRef } from 'react';

interface FlowchartViewerProps {
  definition: string;
  editable?: boolean;
  onChange?: (definition: string) => void;
}

export function FlowchartViewer({ definition, editable, onChange }: FlowchartViewerProps) {
  const containerRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    // Lazy load mermaid only when needed
    import('mermaid' as any).then((mermaid: any) => {
      mermaid.default.initialize({ 
        startOnLoad: true, 
        theme: 'default',
        securityLevel: 'loose',
      });

      if (definition && containerRef.current) {
        mermaid.default.render('mermaid-diagram', definition).then(({ svg }: { svg: string }) => {
          if (containerRef.current) {
            containerRef.current.innerHTML = svg;
          }
        }).catch((err: Error) => {
          console.error('Mermaid rendering error:', err);
          if (containerRef.current) {
            containerRef.current.innerHTML = '<p class="text-red-600">Invalid flowchart syntax</p>';
          }
        });
      }
    }).catch(() => {
      // Mermaid not installed - show message
      if (containerRef.current) {
        containerRef.current.innerHTML = '<p class="text-gray-500">Install mermaid package: npm install mermaid</p>';
      }
    });
  }, [definition]);

  const defaultFlowchart = `graph TD
    A[Start] --> B{Decision}
    B -->|Yes| C[Process 1]
    B -->|No| D[Process 2]
    C --> E[End]
    D --> E`;

  return (
    <div className="space-y-4">
      {editable && (
        <div>
          <label className="block text-sm font-medium mb-2">Flowchart Definition (Mermaid.js)</label>
          <textarea
            value={definition || defaultFlowchart}
            onChange={(e) => onChange?.(e.target.value)}
            className="w-full px-4 py-3 border border-gray-300 rounded font-mono text-sm"
            rows={10}
            placeholder="Enter Mermaid.js flowchart definition..."
          />
          <p className="text-xs text-gray-500 mt-1">
            <a href="https://mermaid.js.org/syntax/flowchart.html" target="_blank" rel="noopener" className="text-blue-600 hover:underline">
              View Mermaid.js documentation
            </a>
          </p>
        </div>
      )}

      <div className="border rounded-lg p-6 bg-white overflow-auto">
        <div ref={containerRef} className="mermaid-container" />
      </div>
    </div>
  );
}
