import { FormEvent, ReactNode } from 'react';
import { HighlightedText } from '../HighlightedText';

interface DataEntryFormProps {
  title: string;
  description: string;
  onSubmit: (event: FormEvent<HTMLFormElement>) => void;
  children: ReactNode;
  actions: ReactNode;
}

export function DataEntryForm({ title, description, onSubmit, children, actions }: DataEntryFormProps) {
  return (
    <div className="panel-card">
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900">
          <HighlightedText text={title} />
        </h3>
        <p className="mt-2 text-sm text-slate-600">{description}</p>
      </div>
      <form onSubmit={onSubmit} className="space-y-4">
        <div className="grid gap-4">{children}</div>
        <div className="flex flex-wrap gap-3">{actions}</div>
      </form>
    </div>
  );
}
