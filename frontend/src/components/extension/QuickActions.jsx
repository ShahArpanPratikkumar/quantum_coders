import { useQuantum } from '../../context/QuantumContext';
import './QuickActions.css';

const ACTIONS = [
  { id: 'summarize',  label: 'Summarize',      prompt: 'Summarize this page for me.' },
  { id: 'keypoints',  label: 'Key Points',     prompt: 'What are the key points of this page?' },
  { id: 'readpage',   label: 'Read Page',      prompt: 'Read this page aloud.' },
  { id: 'explain',    label: 'Explain Simply', prompt: "Explain the main idea like I'm a beginner." },
  { id: 'twominutes', label: '2-Min Summary',  prompt: 'Give me a two-minute summary of this page.' },
  { id: 'translate',  label: 'Translate',      prompt: 'Translate this page to English.' },
];

export default function QuickActions() {
  const { handleUserQuery, status } = useQuantum();
  const busy = ['thinking', 'extracting', 'speaking', 'listening'].includes(status);

  return (
    <div className="pp-qa" role="group" aria-label="Quick actions">
      <p className="pp-label-gold pp-qa__label">Quick actions</p>
      <div className="pp-qa__pills" role="list">
        {ACTIONS.map(action => (
          <button
            key={action.id}
            className="pp-qa__pill"
            onClick={() => !busy && handleUserQuery && handleUserQuery(action.prompt)}
            disabled={busy}
            role="listitem"
            aria-label={action.label}
          >
            {action.label}
          </button>
        ))}
      </div>
    </div>
  );
}
