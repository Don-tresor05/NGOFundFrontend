import { useEffect, useRef } from 'react';
import mermaid from 'mermaid';

interface FlowchartViewerProps {
  chart: string;
  className?: string;
}

mermaid.initialize({ startOnLoad: false, theme: 'default' });

export function FlowchartViewer({ chart, className = '' }: FlowchartViewerProps) {
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (ref.current) {
      ref.current.innerHTML = chart;
      mermaid.run({ nodes: [ref.current] });
    }
  }, [chart]);

  return <div ref={ref} className={className} />;
}
