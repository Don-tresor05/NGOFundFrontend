interface HighlightedTextProps {
  text: string;
}

const KEYWORD_STYLES: Record<string, string> = {
  access: 'keyword-teal',
  account: 'keyword-amber',
  accounts: 'keyword-amber',
  actor: 'keyword-rose',
  actors: 'keyword-rose',
  allocation: 'keyword-emerald',
  analytical: 'keyword-indigo',
  audit: 'keyword-slate',
  budget: 'keyword-purple',
  claim: 'keyword-blue',
  claims: 'keyword-blue',
  compliance: 'keyword-emerald',
  dashboard: 'keyword-indigo',
  donor: 'keyword-emerald',
  donors: 'keyword-emerald',
  event: 'keyword-rose',
  finance: 'keyword-teal',
  financial: 'keyword-teal',
  form: 'keyword-amber',
  funds: 'keyword-emerald',
  intake: 'keyword-amber',
  login: 'keyword-rose',
  portal: 'keyword-indigo',
  profile: 'keyword-blue',
  project: 'keyword-purple',
  projects: 'keyword-purple',
  receipt: 'keyword-emerald',
  requisitions: 'keyword-rose',
  role: 'keyword-amber',
  strategic: 'keyword-indigo',
  system: 'keyword-slate',
  transaction: 'keyword-teal',
  transactions: 'keyword-teal',
  user: 'keyword-blue',
  users: 'keyword-blue',
  workflow: 'keyword-purple',
  workflows: 'keyword-purple',
};

const keywordPattern = new RegExp(`\\b(${Object.keys(KEYWORD_STYLES).join('|')})\\b`, 'gi');

export function HighlightedText({ text }: HighlightedTextProps) {
  const parts = text.split(keywordPattern);

  return (
    <>
      {parts.map((part, index) => {
        const style = KEYWORD_STYLES[part.toLowerCase()];
        if (!style) {
          return part;
        }

        return (
          <span key={`${part}-${index}`} className={`keyword-highlight ${style}`}>
            {part}
          </span>
        );
      })}
    </>
  );
}
